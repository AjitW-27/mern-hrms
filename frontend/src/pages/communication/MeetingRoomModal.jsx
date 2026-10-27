import { Avatar, Modal as Dialog, IconButton, Card as Paper, Input as TextField } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, DialogContent, DialogTitle, Drawer, Stack, Tooltip, Typography } from "@mui/material";
import {
  CallEndRounded,
  ChatRounded,
  CloseRounded,
  MicOffRounded,
  MicRounded,
  MoreHorizRounded,
  ScreenShareRounded,
  SendRounded,
  VideocamOffRounded,
  VideocamRounded,
} from "@mui/icons-material";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../../lib/execReq";

const SOCKET_URL = SOCKET_BASE_URL;
const configuredIceServers = (() => {
  try {
    return JSON.parse(import.meta.env.VITE_ICE_SERVERS || "[]");
  } catch {
    return [];
  }
})();
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    ...configuredIceServers,
  ],
};

const getId = (value) => String(value?._id || value?.id || value || "");
const getRoomId = (meeting) => {
  if (meeting?.roomId) return String(meeting.roomId);
  if (meeting?.meetingLink) {
    try {
      return new URL(meeting.meetingLink).searchParams.get("meetingRoom") || "";
    } catch {
      return "";
    }
  }
  return "";
};

function ParticipantTile({ participant, local }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current)
      videoRef.current.srcObject = participant.stream || null;
  }, [participant.stream]);

  const name = participant.name || "Participant";
  const hasVideo = Boolean(participant.stream?.getVideoTracks?.().length);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 170, md: 220 },
        background: themeColors.navyDark,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={local}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 170,
            objectFit: "cover",
            display: "block",
            background: themeColors.navyDark,
          }}
        />
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ height: "100%", minHeight: 170 }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: themeColors.textMuted,
              color: themeColors.cardBg,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Stack>
      )}
      <Box
        sx={{
          position: "absolute",
          left: 12,
          bottom: 10,
          px: 1,
          py: 0.45,
          borderRadius: "4px",
          background: themeColors.overlay28,
          color: themeColors.cardBg,
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
          {local ? `${name} (You)` : name}
        </Typography>
      </Box>
    </Box>
  );
}

export default function MeetingRoomModal({
  open,
  onClose,
  meeting,
  token,
  currentUser,
}) {
  const roomId = useMemo(() => getRoomId(meeting), [meeting]);
  const [participants, setParticipants] = useState([]);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const iceQueueRef = useRef(new Map());
  const participantMetaRef = useRef(new Map());
  const screenStreamRef = useRef(null);
  const originalVideoTrackRef = useRef(null);

  const currentUserId = getId(currentUser);

  useEffect(() => {
    if (!open || !roomId || !token) return undefined;
    setError("");
    setJoined(false);
    setParticipants([]);
    setChatMessages([]);

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const updateParticipant = (userId, patch) => {
      setParticipants((current) => {
        const existing = current.find((item) => item.userId === String(userId));
        if (existing)
          return current.map((item) =>
            item.userId === String(userId) ? { ...item, ...patch } : item,
          );
        return current.length >= 9
          ? current
          : [...current, { userId: String(userId), ...patch }];
      });
    };

    const removeParticipant = (userId) => {
      const key = String(userId);
      peersRef.current.get(key)?.close();
      peersRef.current.delete(key);
      iceQueueRef.current.delete(key);
      participantMetaRef.current.delete(key);
      setParticipants((current) =>
        current.filter((item) => item.userId !== key),
      );
    };

    const addLocal = (stream) => {
      const me = currentUser || { _id: currentUserId, name: "You" };
      updateParticipant(currentUserId, { ...me, stream });
    };

    const flushIce = async (peerId, pc) => {
      const queued = iceQueueRef.current.get(peerId) || [];
      iceQueueRef.current.delete(peerId);
      for (const candidate of queued) {
        try {
          await pc.addIceCandidate(candidate);
        } catch {}
      }
    };

    const createPeer = async (peerId, initiator, meta = {}) => {
      const key = String(peerId);
      if (peersRef.current.has(key)) return peersRef.current.get(key);
      const pc = new RTCPeerConnection(RTC_CONFIG);
      localStreamRef.current
        ?.getTracks?.()
        .forEach((track) => pc.addTrack(track, localStreamRef.current));
      pc.ontrack = (event) => {
        const stream = event.streams?.[0];
        participantMetaRef.current.set(key, {
          ...participantMetaRef.current.get(key),
          ...meta,
        });
        updateParticipant(key, { ...meta, userId: key, stream });
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("meeting:ice-candidate", {
            roomId,
            targetUserId: key,
            candidate: event.candidate,
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState))
          removeParticipant(key);
      };
      peersRef.current.set(key, pc);
      participantMetaRef.current.set(key, {
        ...participantMetaRef.current.get(key),
        ...meta,
      });
      updateParticipant(key, { ...meta, userId: key });

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("meeting:offer", { roomId, targetUserId: key, offer });
      }
      return pc;
    };

    const joinMeeting = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error("Browser media access is unavailable.");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        originalVideoTrackRef.current = stream.getVideoTracks?.()[0] || null;
        addLocal(stream);

        socket.emit("meeting:join", { roomId }, (result) => {
          if (!result?.ok) {
            setError(result?.message || "Unable to join the meeting.");
            stream.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
            return;
          }
          setJoined(true);
        });
      } catch (joinError) {
        setError(
          joinError?.message || "Unable to access your microphone or camera.",
        );
      }
    };

    socket.on("meeting:peers", ({ peers = [] } = {}) => {
      peers.forEach((peer) => {
        participantMetaRef.current.set(String(peer.userId), peer.user || {});
        updateParticipant(String(peer.userId), {
          ...peer.user,
          userId: String(peer.userId),
        });
      });
    });

    socket.on("user-joined", ({ userId, user } = {}) => {
      if (!userId || String(userId) === currentUserId) return;
      createPeer(String(userId), true, user || {}).catch((joinError) =>
        setError(joinError?.message || "Unable to connect a participant."),
      );
    });

    socket.on("meeting:offer", async ({ fromUserId, offer } = {}) => {
      if (!fromUserId || !offer) return;
      try {
        const pc = await createPeer(
          String(fromUserId),
          false,
          participantMetaRef.current.get(String(fromUserId)) || {},
        );
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIce(String(fromUserId), pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("meeting:answer", {
          roomId,
          targetUserId: String(fromUserId),
          answer,
        });
      } catch (signalError) {
        setError(
          signalError?.message || "Unable to establish the meeting connection.",
        );
      }
    });

    socket.on("meeting:answer", async ({ fromUserId, answer } = {}) => {
      const pc = peersRef.current.get(String(fromUserId));
      if (!pc || !answer) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushIce(String(fromUserId), pc);
      } catch (signalError) {
        setError(
          signalError?.message || "Unable to finish the meeting handshake.",
        );
      }
    });

    socket.on(
      "meeting:ice-candidate",
      async ({ fromUserId, candidate } = {}) => {
        if (!fromUserId || !candidate) return;
        const key = String(fromUserId);
        const pc = peersRef.current.get(key);
        if (!pc) {
          const queued = iceQueueRef.current.get(key) || [];
          queued.push(candidate);
          iceQueueRef.current.set(key, queued);
          return;
        }
        try {
          if (pc.remoteDescription)
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          else {
            const queued = iceQueueRef.current.get(key) || [];
            queued.push(candidate);
            iceQueueRef.current.set(key, queued);
          }
        } catch {}
      },
    );

    socket.on("user-left", ({ userId } = {}) => removeParticipant(userId));
    socket.on("meeting:chat", ({ userId, text, createdAt } = {}) => {
      if (!text) return;
      const meta = participantMetaRef.current.get(String(userId)) || {};
      setChatMessages((current) => [
        ...current,
        {
          id: `${userId}-${createdAt}-${Math.random()}`,
          userId: String(userId),
          name: meta.name || "Participant",
          text,
          createdAt,
        },
      ]);
    });
    socket.on("meeting:error", ({ message: errorMessage } = {}) =>
      setError(errorMessage || "Meeting room error."),
    );
    socket.on("connect_error", (connectError) =>
      setError(connectError?.message || "Meeting connection failed."),
    );

    joinMeeting();

    return () => {
      if (screenStreamRef.current)
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      socket.emit("meeting:leave", { roomId });
      socket.disconnect();
      socketRef.current = null;
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      iceQueueRef.current.clear();
      localStreamRef.current?.getTracks?.().forEach((track) => track.stop());
      localStreamRef.current = null;
      screenStreamRef.current = null;
      originalVideoTrackRef.current = null;
    };
  }, [open, roomId, token, currentUserId]);

  const toggleMute = () => {
    const nextMuted = !muted;
    localStreamRef.current?.getAudioTracks?.().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextOff = !cameraOff;
    localStreamRef.current?.getVideoTracks?.().forEach((track) => {
      track.enabled = !nextOff;
    });
    setCameraOff(nextOff);
  };

  const shareScreen = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen sharing is unavailable in this browser.");
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = displayStream.getVideoTracks()[0];
      screenStreamRef.current = displayStream;
      for (const pc of peersRef.current.values()) {
        const sender = pc
          .getSenders()
          .find((item) => item.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
      }
      setParticipants((current) =>
        current.map((item) =>
          item.userId === currentUserId
            ? { ...item, stream: displayStream }
            : item,
        ),
      );
      screenTrack.onended = async () => {
        const original = originalVideoTrackRef.current;
        for (const pc of peersRef.current.values()) {
          const sender = pc
            .getSenders()
            .find((item) => item.track?.kind === "video");
          if (sender && original) await sender.replaceTrack(original);
        }
        if (localStreamRef.current)
          setParticipants((current) =>
            current.map((item) =>
              item.userId === currentUserId
                ? { ...item, stream: localStreamRef.current }
                : item,
            ),
          );
      };
    } catch (shareError) {
      if (shareError?.name !== "NotAllowedError")
        setError(shareError?.message || "Unable to share your screen.");
    }
  };

  const sendMeetingChat = () => {
    const text = chatDraft.trim();
    if (!text || !socketRef.current || !roomId) return;
    const payload = { roomId, text, createdAt: new Date().toISOString() };
    setChatMessages((current) => [
      ...current,
      {
        ...payload,
        id: `local-${Date.now()}`,
        userId: currentUserId,
        name: currentUser?.name || "You",
      },
    ]);
    socketRef.current.emit("meeting:chat", payload);
    setChatDraft("");
  };

  const leaveMeeting = () => {
    socketRef.current?.emit("meeting:leave", { roomId });
    onClose?.();
  };

  return (
    <DialogShell
      open={open}
      onClose={leaveMeeting}
      title={meeting?.title || "Meeting room"}
    >
      <Box
        sx={{
          background: themeColors.navyDark,
          color: themeColors.cardBg,
          height: { xs: "80vh", md: "82vh" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {error ? (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ m: 1.5, borderRadius: "4px" }}
          >
            {error}
          </Alert>
        ) : null}
        <Box
          sx={{
            flex: 1,
            p: { xs: 1, md: 1.5 },
            overflow: "auto",
            display: "grid",
            gridTemplateColumns:
              participants.length <= 1
                ? "1fr"
                : {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0,1fr))",
                    lg: "repeat(3, minmax(0,1fr))",
                  },
            gap: 1.2,
            alignContent: "center",
          }}
        >
          {!joined ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ gridColumn: "1 / -1", height: "100%" }}
            >
              <CircularPulse />
              <Typography sx={{ mt: 2, color: themeColors.border, fontSize: 14 }}>
                Joining meeting…
              </Typography>
            </Stack>
          ) : (
            participants.map((participant) => (
              <ParticipantTile
                key={participant.userId}
                participant={participant}
                local={participant.userId === currentUserId}
              />
            ))
          )}
        </Box>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 0.7, sm: 1 }}
          sx={{
            px: 1.5,
            py: 1.2,
            background: themeColors.navyDark,
            borderTop: "1px solid " + themeColors.secondaryDark,
          }}
        >
          <ControlButton
            title={muted ? "Unmute" : "Mute"}
            active={muted}
            onClick={toggleMute}
          >
            {muted ? <MicOffRounded /> : <MicRounded />}
          </ControlButton>
          <ControlButton
            title={cameraOff ? "Turn camera on" : "Turn camera off"}
            active={cameraOff}
            onClick={toggleCamera}
          >
            {cameraOff ? <VideocamOffRounded /> : <VideocamRounded />}
          </ControlButton>
          <ControlButton title="Share screen" onClick={shareScreen}>
            <ScreenShareRounded />
          </ControlButton>
          <ControlButton
            title="Meeting chat"
            active={chatOpen}
            onClick={() => setChatOpen((value) => !value)}
          >
            <ChatRounded />
          </ControlButton>
          <ControlButton title="More">
            <MoreHorizRounded />
          </ControlButton>
          <IconButton
            onClick={leaveMeeting}
            sx={{
              ml: 1,
              width: 48,
              height: 48,
              borderRadius: "4px",
              bgcolor: themeColors.primary,
              color: themeColors.cardBg,
              "&:hover": { bgcolor: themeColors.primary },
            }}
          >
            <CallEndRounded />
          </IconButton>
        </Stack>
      </Box>
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 360 }, background: themeColors.cardBg },
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderBottom: "1px solid " + themeColors.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
            Meeting chat
          </Typography>
          <IconButton size="small" onClick={() => setChatOpen(false)}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
        <Stack
          sx={{
            flex: 1,
            height: "calc(100% - 122px)",
            p: 1.5,
            overflowY: "auto",
            bgcolor: themeColors.hover,
          }}
          spacing={1}
        >
          {chatMessages.length ? (
            chatMessages.map((item) => (
              <Box
                key={item.id}
                sx={{
                  alignSelf:
                    item.userId === currentUserId ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                }}
              >
                <Paper
                  sx={{
                    p: 1.1,
                    borderRadius: "4px",
                    bgcolor:
                      item.userId === currentUserId ? themeColors.primarySoft : themeColors.cardBg,
                    boxShadow: "none",
                    border: "1px solid " + themeColors.border,
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 800, mb: 0.35 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, lineHeight: 1.55 }}>
                    {item.text}
                  </Typography>
                </Paper>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: "center", mt: 6, color: themeColors.textMuted }}>
              <ChatRounded sx={{ fontSize: 36, color: "none" }} />
              <Typography sx={{ fontSize: 12, mt: 1 }}>
                No meeting messages yet.
              </Typography>
            </Box>
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 1.5, borderTop: "1px solid " + themeColors.border }}
        >
          <TextField
            fullWidth
            size="small"
            value={chatDraft}
            onChange={(event) => setChatDraft(event.target.value)}
            placeholder="Send a message"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMeetingChat();
              }
            }}
          />
          <IconButton
            onClick={sendMeetingChat}
            disabled={!chatDraft.trim()}
            sx={{ borderRadius: "4px", bgcolor: themeColors.primarySoft, color: themeColors.secondaryDark }}
          >
            <SendRounded />
          </IconButton>
        </Stack>
      </Drawer>
    </DialogShell>
  );
}

function DialogShell({ open, onClose, title, children }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          bgcolor: themeColors.navyDark,
          color: themeColors.cardBg,
          borderRadius: "4px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1,
          px: 1.5,
          background: themeColors.navyDark,
          color: themeColors.cardBg,
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        {title}
        <IconButton onClick={onClose} size="small" sx={{ color: themeColors.cardBg }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, background: themeColors.navyDark }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function ControlButton({ children, title, onClick, active }) {
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onClick}
        sx={{
          width: 46,
          height: 46,
          borderRadius: "4px",
          bgcolor: active ? themeColors.textMuted : themeColors.secondaryDark,
          color: themeColors.cardBg,
          "&:hover": { bgcolor: themeColors.textMuted },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

function CircularPulse() {
  return (
    <Box
      sx={{
        width: 42,
        height: 42,
        border: "3px solid " + themeColors.textMuted,
        borderTopColor: themeColors.info,
        borderRadius: "50%",
        animation: "hrms-spin 1s linear infinite",
        "@keyframes hrms-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      }}
    />
  );
}
