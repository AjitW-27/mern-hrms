const crypto = require("crypto");
const mongoose = require("mongoose");
const MeetingRoom = require("../models/meetingRoomModel");
const Meeting = require("../models/communicationModel").Meeting;
const User = require("../models/userModel");
const Conversation = require("../models/communicationModel").Conversation;
const asyncHandler = require("../utils/asyncHandler");

const buildRoomId = () => `room-${crypto.randomBytes(8).toString("hex")}`;

const uniqueRoomId = async () => {
  for (;;) {
    const roomId = buildRoomId();
    const exists = await MeetingRoom.exists({ roomId });
    if (!exists) return roomId;
  }
};

const createMeetingRoomDocument = async ({ hostId, title, participants = [], startTime, io, conversationId = null }) => {
  const roomId = await uniqueRoomId();
  const room = await MeetingRoom.create({
    roomId,
    host: hostId,
    title,
    participants,
    startTime,
    isActive: false,
  });

  const inviteeIds = new Set(participants.map(String));
  if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: hostId,
    }).select("participants").lean();
    for (const participantId of conversation?.participants || []) inviteeIds.add(String(participantId));

    if (conversation?.participants?.length) {
      await MeetingRoom.updateOne(
        { _id: room._id },
        { $set: { participants: [...new Set(conversation.participants.map(String))].filter((id) => id !== String(hostId)) } },
      );
    }

  }

  const finalRoom = await MeetingRoom.findById(room._id)
    .populate("host", "name email avatar role department")
    .populate("participants", "name email avatar role department")
    .lean();

  if (io && conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    io.to(`conversation_${conversationId}`).emit("meeting:invited", { room: finalRoom });
  }

  if (io) {
    for (const participantId of inviteeIds) {
      if (participantId !== String(hostId)) {
        io.to(`user_${participantId}`).emit("meeting:invited", { room: finalRoom });
      }
    }
  }

  return finalRoom;
};

const createMeetingRoom = asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const startTime = new Date(req.body.startTime);
  if (!title) return res.status(400).json({ success: false, message: "Meeting title is required." });
  if (Number.isNaN(startTime.getTime())) {
    return res.status(400).json({ success: false, message: "A valid meeting start time is required." });
  }

  const requested = Array.isArray(req.body.participantIds)
    ? [...new Set(req.body.participantIds.map(String).filter(Boolean))]
    : [];
  if (requested.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ success: false, message: "One or more participants are invalid." });
  }

  const users = requested.length
    ? await User.find({ _id: { $in: requested }, isActive: { $ne: false } }).select("_id").lean()
    : [];
  if (users.length !== requested.length) {
    return res.status(404).json({ success: false, message: "One or more participants were not found." });
  }

  const room = await createMeetingRoomDocument({
    hostId: req.user._id,
    title,
    participants: users.map((item) => item._id),
    startTime,
    io: req.app.get("io"),
    conversationId: req.body.conversationId || null,
  });

  res.status(201).json({
    success: true,
    data: {
      ...room,
      roomId: room.roomId,
      meetingLink: `${String(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "")}/dashboard/communication?meetingRoom=${encodeURIComponent(room.roomId)}`,
    },
  });
});

const listActiveMeetings = asyncHandler(async (req, res) => {
  const now = new Date();
  const data = await MeetingRoom.find({
    isActive: true,
    startTime: { $lte: new Date(now.getTime() + 15 * 60 * 1000) },
  })
    .populate("host", "name email avatar role department")
    .populate("participants", "name email avatar role department")
    .sort({ startTime: 1 })
    .limit(100)
    .lean();

  res.json({ success: true, data });
});

const getMeetingRoomById = asyncHandler(async (req, res) => {
  const room = await MeetingRoom.findOne({ roomId: String(req.params.roomId) })
    .populate("host", "name email avatar role department")
    .populate("participants", "name email avatar role department")
    .lean();
  if (!room) return res.status(404).json({ success: false, message: "Meeting room not found." });
  const authorized = [String(room.host?._id), ...(room.participants || []).map((item) => String(item._id))].includes(String(req.user._id));
  if (!authorized) return res.status(403).json({ success: false, message: "You are not invited to this meeting." });
  res.json({ success: true, data: room });
});

module.exports = {
  buildRoomId,
  uniqueRoomId,
  createMeetingRoomDocument,
  createMeetingRoom,
  listActiveMeetings,
  getMeetingRoomById,
};
