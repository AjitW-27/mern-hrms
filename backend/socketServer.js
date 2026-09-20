const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const { Conversation, CallLog } = require("./models/communicationModel");
const MeetingRoom = require("./models/meetingRoomModel");
const logger = require("./utils/logger");

const normalizeUserId = (value) => String(value || "");

const setupSocketServer = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) {
        return next(new Error("Socket authentication required"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error("Invalid socket token"));
      socket.userId = String(decoded.id);
      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Frontend connected: ${socket.id}`);
    socket.join(`user_${socket.userId}`);
    socket.data.meetingRooms = new Set();

    socket.on("join_room", (userId) => {
      if (normalizeUserId(userId) === socket.userId) {
        socket.join(`user_${socket.userId}`);
      }
    });

    socket.on("communication:join", async (conversationId) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        }).select("_id");
        if (conversation) socket.join(`conversation_${conversation._id}`);
      } catch (error) {
        logger.warn(`Socket conversation join failed: ${error.message}`);
      }
    });

    socket.on("communication:typing", async ({ conversationId, isTyping } = {}) => {
      if (!conversationId) return;
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        }).select("_id");
        if (conversation) {
          socket.to(`conversation_${conversationId}`).emit("communication:typing", {
            conversationId: String(conversationId),
            userId: socket.userId,
            isTyping: Boolean(isTyping),
          });
        }
      } catch (error) {
        logger.warn(`Socket typing event failed: ${error.message}`);
      }
    });

    // -----------------------------------------------------------------------
    // Meeting room / WebRTC signaling
    // -----------------------------------------------------------------------
    socket.on("meeting:join", async (payload = {}, ack) => {
      const roomId = String(payload.roomId || "").trim();
      const done = typeof ack === "function" ? ack : () => {};
      if (!roomId) return done({ ok: false, message: "Meeting room is required." });

      try {
        const room = await MeetingRoom.findOne({ roomId }).lean();
        if (!room) return done({ ok: false, message: "Meeting room not found." });

        const authorized = [String(room.host), ...(room.participants || []).map(String)].includes(socket.userId);
        if (!authorized) return done({ ok: false, message: "You are not invited to this meeting." });

        const socketsInRoom = await io.in(`meeting_${roomId}`).fetchSockets();
        const alreadyJoined = socketsInRoom.some((peer) => String(peer.userId) === socket.userId);
        if (!alreadyJoined && socketsInRoom.length >= 9) {
          return done({ ok: false, message: "This meeting room is full (maximum 9 participants)." });
        }

        await MeetingRoom.updateOne(
          { roomId },
          { $set: { isActive: true } },
        );

        const peerUserIds = socketsInRoom
          .filter((peer) => String(peer.userId) !== socket.userId)
          .map((peer) => String(peer.userId));
        const peerUsers = peerUserIds.length
          ? await User.find({ _id: { $in: peerUserIds }, isActive: { $ne: false } })
              .select("name email avatar role department")
              .lean()
          : [];
        const peerMap = new Map(peerUsers.map((user) => [String(user._id), user]));
        const peers = peerUserIds.map((userId) => ({
          userId,
          user: peerMap.get(userId) || { _id: userId },
        }));

        socket.join(`meeting_${roomId}`);
        socket.data.meetingRooms.add(roomId);

        const currentUser = await User.findById(socket.userId)
          .select("name email avatar role department")
          .lean();

        socket.emit("meeting:peers", {
          roomId,
          peers,
          self: currentUser,
        });

        socket.to(`meeting_${roomId}`).emit("user-joined", {
          roomId,
          userId: socket.userId,
          user: currentUser || { _id: socket.userId },
        });

        done({ ok: true, roomId, peers });
      } catch (error) {
        logger.warn(`Meeting join failed: ${error.message}`);
        done({ ok: false, message: "Unable to join meeting room." });
      }
    });

    const canRelayMeetingSignal = async (roomId, targetUserId) => {
      if (!roomId || !targetUserId || !socket.data.meetingRooms.has(roomId)) return false;
      const socketsInRoom = await io.in(`meeting_${roomId}`).fetchSockets();
      const bothConnected = socketsInRoom.some((peer) => String(peer.userId) === socket.userId)
        && socketsInRoom.some((peer) => String(peer.userId) === String(targetUserId));
      return bothConnected;
    };

    const relayMeetingSignal = async (eventName, payload = {}) => {
      const roomId = String(payload.roomId || "");
      const targetUserId = String(payload.targetUserId || "");
      if (!roomId || !targetUserId || !(await canRelayMeetingSignal(roomId, targetUserId))) return;
      io.to(`user_${targetUserId}`).emit(eventName, {
        ...payload,
        roomId,
        fromUserId: socket.userId,
        targetUserId,
      });
    };

    socket.on("meeting:offer", (payload) => relayMeetingSignal("meeting:offer", payload));
    socket.on("meeting:answer", (payload) => relayMeetingSignal("meeting:answer", payload));
    socket.on("meeting:ice-candidate", (payload) => relayMeetingSignal("meeting:ice-candidate", payload));

    socket.on("meeting:chat", async (payload = {}) => {
      const roomId = String(payload.roomId || "");
      const text = String(payload.text || "").trim();
      if (!roomId || !text || text.length > 1000 || !socket.data.meetingRooms.has(roomId)) return;
      const sender = await User.findById(socket.userId).select("name email avatar").lean();
      socket.to(`meeting_${roomId}`).emit("meeting:chat", {
        roomId,
        userId: socket.userId,
        user: sender || { _id: socket.userId, name: "Participant" },
        text,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("meeting:leave", async (payload = {}) => {
      const roomId = String(payload.roomId || "");
      if (!roomId || !socket.data.meetingRooms.has(roomId)) return;
      socket.leave(`meeting_${roomId}`);
      socket.data.meetingRooms.delete(roomId);
      socket.to(`meeting_${roomId}`).emit("user-left", {
        roomId,
        userId: socket.userId,
      });
      try {
        const remaining = await io.in(`meeting_${roomId}`).fetchSockets();
        if (!remaining.length) {
          await MeetingRoom.updateOne({ roomId }, { $set: { isActive: false } });
        }
      } catch (error) {
        logger.warn(`Meeting leave cleanup failed: ${error.message}`);
      }
    });

    // -----------------------------------------------------------------------
    // Existing one-to-one call signaling
    // -----------------------------------------------------------------------
    const canRelayCall = async (callId, targetUserId) => {
      if (!callId || !targetUserId) return false;
      const call = await CallLog.findOne({
        _id: callId,
        $or: [
          { caller: socket.userId, callee: targetUserId },
          { caller: targetUserId, callee: socket.userId },
        ],
      }).select("_id").lean();
      return Boolean(call);
    };

    socket.on("call:invite", async (payload = {}) => {
      if (!payload.toUserId || !payload.callId || !(await canRelayCall(payload.callId, payload.toUserId))) return;
      const [target, caller] = await Promise.all([
        User.findOne({ _id: payload.toUserId, isActive: { $ne: false } }).select("_id name email avatar").lean(),
        User.findOne({ _id: socket.userId, isActive: { $ne: false } }).select("_id name email avatar").lean(),
      ]);
      if (!target || !caller) return;
      io.to(`user_${target._id}`).emit("call:incoming", {
        callId: String(payload.callId),
        fromUserId: socket.userId,
        type: payload.type === "video" ? "video" : "audio",
        contact: caller,
      });
    });

    socket.on("call:accepted", async (payload = {}) => {
      if (payload.toUserId && payload.callId && await canRelayCall(payload.callId, payload.toUserId)) {
        io.to(`user_${payload.toUserId}`).emit("call:accepted", {
          callId: String(payload.callId),
          fromUserId: socket.userId,
        });
      }
    });

    socket.on("call:rejected", async (payload = {}) => {
      if (payload.toUserId && payload.callId && await canRelayCall(payload.callId, payload.toUserId)) {
        io.to(`user_${payload.toUserId}`).emit("call:rejected", {
          callId: String(payload.callId),
          fromUserId: socket.userId,
        });
      }
    });

    socket.on("call:offer", async (payload = {}) => {
      if (payload.toUserId && payload.callId && payload.sdp && await canRelayCall(payload.callId, payload.toUserId)) {
        io.to(`user_${payload.toUserId}`).emit("call:offer", { ...payload, fromUserId: socket.userId });
      }
    });

    socket.on("call:answer", async (payload = {}) => {
      if (payload.toUserId && payload.callId && payload.sdp && await canRelayCall(payload.callId, payload.toUserId)) {
        io.to(`user_${payload.toUserId}`).emit("call:answer", { ...payload, fromUserId: socket.userId });
      }
    });

    socket.on("call:ice", async (payload = {}) => {
      if (payload.toUserId && payload.callId && payload.candidate && await canRelayCall(payload.callId, payload.toUserId)) {
        io.to(`user_${payload.toUserId}`).emit("call:ice", { ...payload, fromUserId: socket.userId });
      }
    });

    socket.on("call:end", async (payload = {}) => {
      if (payload.toUserId && payload.callId && await canRelayCall(payload.callId, payload.toUserId)) {
        io.to(`user_${payload.toUserId}`).emit("call:end", {
          callId: String(payload.callId),
          fromUserId: socket.userId,
        });
      }
    });

    socket.on("disconnect", async () => {
      for (const roomId of socket.data.meetingRooms || []) {
        socket.to(`meeting_${roomId}`).emit("user-left", {
          roomId,
          userId: socket.userId,
        });
        try {
          const remaining = await io.in(`meeting_${roomId}`).fetchSockets();
          if (!remaining.length) {
            await MeetingRoom.updateOne({ roomId }, { $set: { isActive: false } });
          }
        } catch (error) {
          logger.warn(`Meeting disconnect cleanup failed: ${error.message}`);
        }
      }
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketServer;
