const mongoose = require("mongoose");
const User = require("../models/userModel");
const { Conversation, Message, Meeting, CallLog } = require("../models/communicationModel");
const asyncHandler = require("../utils/asyncHandler");
const { ensureHrBotUser, getHrBotResponse } = require("./chatController");
const { createMeetingRoomDocument } = require("./meetingRoomController");

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const getUserIds = (user) => String(user?._id || "");

const findConversationForUser = async (conversationId, userId) => {
  if (!isValidId(conversationId)) return null;
  return Conversation.findOne({ _id: conversationId, participants: userId });
};

const listContacts = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id }, isSystemBot: { $ne: true }, isActive: { $ne: false } })
    .select("name email role department avatar designation employeeId")
    .sort({ name: 1 })
    .limit(200)
    .lean();

  res.json({ success: true, data: users });
});

const listConversations = asyncHandler(async (req, res) => {
  const data = await Conversation.find({ participants: req.user._id })
    .populate("participants", "name email role department avatar")
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(100)
    .lean();

  const conversationIds = data.map((item) => item._id);
  const unreadRows = conversationIds.length
    ? await Message.aggregate([
        {
          $match: {
            conversation: { $in: conversationIds },
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id },
          },
        },
        { $group: { _id: "$conversation", unreadCount: { $sum: 1 } } },
      ])
    : [];

  const unreadMap = new Map(unreadRows.map((row) => [String(row._id), row.unreadCount]));
  const enriched = data.map((item) => ({
    ...item,
    unreadCount: unreadMap.get(String(item._id)) || 0,
  }));

  res.json({ success: true, data: enriched });
});

const unreadSummary = asyncHandler(async (req, res) => {
  const unreadMessages = await Message.find({
    sender: { $ne: req.user._id },
    readBy: { $ne: req.user._id },
    conversation: {
      $in: await Conversation.find({ participants: req.user._id }).distinct("_id"),
    },
  })
    .populate("sender", "name email avatar role department")
    .populate("conversation", "title participants type")
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();

  const grouped = new Map();
  for (const item of unreadMessages) {
    const id = String(item.conversation?._id || item.conversation || "");
    if (!id) continue;
    const existing = grouped.get(id);
    if (existing) {
      existing.unreadCount += 1;
    } else {
      grouped.set(id, {
        conversationId: id,
        title: item.conversation?.title || "",
        type: item.conversation?.type || "direct",
        sender: item.sender || null,
        text: item.text || "",
        createdAt: item.createdAt,
        unreadCount: 1,
      });
    }
  }

  const items = Array.from(grouped.values())
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const unreadCount = await Message.countDocuments({
    sender: { $ne: req.user._id },
    readBy: { $ne: req.user._id },
    conversation: {
      $in: await Conversation.find({ participants: req.user._id }).distinct("_id"),
    },
  });

  res.json({ success: true, data: { unreadCount, items } });
});

const createConversation = asyncHandler(async (req, res) => {
  const participantId = String(req.body.participantId || "");
  const participantIds = Array.isArray(req.body.participantIds)
    ? req.body.participantIds.map(String).filter(Boolean)
    : participantId
      ? [participantId]
      : [];

  const cleanIds = [...new Set(participantIds.concat(getUserIds(req.user)))];
  if (cleanIds.length < 2 || cleanIds.some((id) => !isValidId(id))) {
    return res.status(400).json({ success: false, message: "At least one valid participant is required." });
  }

  const users = await User.find({ _id: { $in: cleanIds }, isActive: { $ne: false } }).select("_id").lean();
  if (users.length !== cleanIds.length) {
    return res.status(404).json({ success: false, message: "One or more participants were not found." });
  }

  let conversation = null;
  if (cleanIds.length === 2) {
    conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: cleanIds },
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    });
  }

  if (!conversation) {
    conversation = await Conversation.create({
      participants: cleanIds,
      type: cleanIds.length === 2 ? "direct" : "group",
      title: String(req.body.title || "").trim(),
      createdBy: req.user._id,
    });
  }

  conversation = await Conversation.findById(conversation._id)
    .populate("participants", "name email role department avatar")
    .lean();

  res.status(201).json({ success: true, data: conversation });
});

const listMessages = asyncHandler(async (req, res) => {
  const conversation = await findConversationForUser(req.params.id, req.user._id);
  if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });

  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);
  const data = await Message.find({ conversation: conversation._id })
    .populate("sender", "name email role avatar")
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  res.json({ success: true, data });
});

const createMessage = asyncHandler(async (req, res) => {
  const conversation = await findConversationForUser(req.params.id, req.user._id);
  if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });

  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ success: false, message: "Message text is required." });
  if (text.length > 5000) return res.status(400).json({ success: false, message: "Message is too long." });

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text,
    readBy: [req.user._id],
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessageText: text.slice(0, 240),
    lastMessageAt: new Date(),
    lastMessageSender: req.user._id,
  });

  const isBotMention = /^@HR\s*Bot\b/i.test(text);
  let bot = null;
  let isBotConversation = false;
  if (isBotMention) {
    bot = await ensureHrBotUser();
    isBotConversation = conversation.participants.some((participantId) => String(participantId) === String(bot._id));
  } else {
    const botParticipant = await User.findOne({ _id: { $in: conversation.participants }, isSystemBot: true }).select("_id name email role avatar").lean();
    bot = botParticipant;
    isBotConversation = Boolean(botParticipant);
  }
  const shouldAnswer = isBotConversation || isBotMention;

  let botMessage = null;
  if (shouldAnswer) {
    if (!bot) bot = await ensureHrBotUser();
    const answer = await getHrBotResponse(text, req.user._id);
    botMessage = await Message.create({
      conversation: conversation._id,
      sender: bot._id,
      text: answer,
      readBy: [bot._id],
    });
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessageText: answer.slice(0, 240),
      lastMessageAt: new Date(),
      lastMessageSender: bot._id,
    });
  }

  const data = await Message.find({ _id: { $in: [message._id, ...(botMessage ? [botMessage._id] : [])] } })
    .populate("sender", "name email role avatar")
    .populate("conversation", "title type participants")
    .sort({ createdAt: 1 })
    .lean();

  const io = req.app.get("io");
  if (io) {
    for (const payload of data) {
      io.to(`conversation_${conversation._id}`).emit("communication:message", payload);
      for (const participantId of conversation.participants || []) {
        io.to(`user_${participantId}`).emit("communication:message", payload);
      }
    }
  }

  res.status(201).json({ success: true, data: data[0], botResponse: botMessage ? data[data.length - 1] : null });
});

const listMeetings = asyncHandler(async (req, res) => {
  const data = await Meeting.find({
    $or: [{ organizer: req.user._id }, { participants: req.user._id }],
  })
    .populate("organizer", "name email")
    .populate("participants", "name email role department avatar")
    .sort({ startAt: 1 })
    .limit(100)
    .lean();

  const enriched = data.map((meeting) => {
    let roomId = "";
    if (meeting.meetingLink) {
      try {
        roomId = new URL(meeting.meetingLink).searchParams.get("meetingRoom") || "";
      } catch {}
    }
    return { ...meeting, roomId };
  });

  res.json({ success: true, data: enriched });
});

const resolveParticipantEmails = async (emails = []) => {
  const normalized = [...new Set(emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean))];
  if (!normalized.length) return [];
  const users = await User.find({ email: { $in: normalized }, isActive: { $ne: false } }).select("_id email").lean();
  return users;
};

const createMeeting = asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const startAt = new Date(req.body.startAt);
  const endAt = new Date(req.body.endAt);
  const type = req.body.meetingType === "in-person" ? "in-person" : "online";

  if (!title) return res.status(400).json({ success: false, message: "Meeting title is required." });
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return res.status(400).json({ success: false, message: "Valid start and end date/time are required." });
  }
  if (endAt <= startAt) return res.status(400).json({ success: false, message: "End time must be after start time." });
  if (startAt < new Date(Date.now() - 60 * 1000)) return res.status(400).json({ success: false, message: "Meeting must be scheduled in the future." });

  const requestedIds = Array.isArray(req.body.participantIds) ? req.body.participantIds.map(String).filter(Boolean) : [];
  let participants = [];
  if (requestedIds.length) {
    if (requestedIds.some((id) => !isValidId(id))) return res.status(400).json({ success: false, message: "Invalid participant." });
    participants = await User.find({ _id: { $in: requestedIds }, isActive: { $ne: false } }).select("_id").lean();
  } else if (Array.isArray(req.body.participantEmails)) {
    participants = await resolveParticipantEmails(req.body.participantEmails);
  }

  if (participants.length !== requestedIds.length && requestedIds.length) {
    return res.status(404).json({ success: false, message: "One or more participants were not found." });
  }

  const participantIds = participants.map((item) => item._id);
  let meetingLink = "";
  let roomId = "";
  if (type === "online") {
    const room = await createMeetingRoomDocument({
      hostId: req.user._id,
      title,
      participants: participantIds,
      startTime: startAt,
      io: req.app.get("io"),
      conversationId: req.body.conversationId || null,
    });
    roomId = String(room.roomId);
    meetingLink = `${String(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "")}/dashboard/communication?meetingRoom=${encodeURIComponent(roomId)}`;
  }

  const meeting = await Meeting.create({
    title,
    description: String(req.body.description || "").trim(),
    startAt,
    endAt,
    organizer: req.user._id,
    participants: participantIds,
    meetingType: type,
    location: String(req.body.location || "").trim(),
    meetingLink,
  });

  const data = await Meeting.findById(meeting._id)
    .populate("organizer", "name email")
    .populate("participants", "name email role department avatar")
    .lean();

  res.status(201).json({ success: true, data: { ...data, roomId } });
});

const cancelMeeting = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid meeting id." });
  const meeting = await Meeting.findOne({ _id: req.params.id, organizer: req.user._id });
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
  meeting.status = "cancelled";
  await meeting.save();
  res.json({ success: true, data: meeting });
});

const listCalls = asyncHandler(async (req, res) => {
  const data = await CallLog.find({ $or: [{ caller: req.user._id }, { callee: req.user._id }] })
    .populate("caller", "name email avatar")
    .populate("callee", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data });
});

const createCall = asyncHandler(async (req, res) => {
  const calleeId = String(req.body.calleeId || "");
  if (!isValidId(calleeId)) return res.status(400).json({ success: false, message: "A valid callee is required." });
  if (String(req.user._id) === calleeId) return res.status(400).json({ success: false, message: "You cannot call yourself." });

  const callee = await User.findOne({ _id: calleeId, isActive: { $ne: false } }).select("_id name email").lean();
  if (!callee) return res.status(404).json({ success: false, message: "User not found or inactive." });

  const type = req.body.type === "video" ? "video" : "audio";
  const call = await CallLog.create({ caller: req.user._id, callee: callee._id, type, status: "ringing", startedAt: new Date() });
  res.status(201).json({ success: true, data: call });
});

const updateCallStatus = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid call id." });
  const call = await CallLog.findOne({ _id: req.params.id, $or: [{ caller: req.user._id }, { callee: req.user._id }] });
  if (!call) return res.status(404).json({ success: false, message: "Call record not found." });

  const allowedStatuses = ["accepted", "rejected", "missed", "ended"];
  const status = String(req.body.status || "").toLowerCase();
  if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid call status." });

  if (status === "accepted" && call.status === "ringing") {
    call.status = "accepted";
    call.startedAt = call.startedAt || new Date();
  } else if (status === "ended") {
    call.status = "ended";
    call.endedAt = new Date();
    call.durationSeconds = Math.max(0, Math.round((call.endedAt - new Date(call.startedAt || call.createdAt)) / 1000));
  } else if (status !== "accepted") {
    call.status = status;
    if (["rejected", "missed"].includes(status)) call.endedAt = new Date();
  }

  await call.save();
  res.json({ success: true, data: call });
});

module.exports = {
  listContacts,
  listConversations,
  unreadSummary,
  createConversation,
  listMessages,
  createMessage,
  listMeetings,
  createMeeting,
  cancelMeeting,
  listCalls,
  createCall,
  updateCallStatus,
};
