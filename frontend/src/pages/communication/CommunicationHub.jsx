import { Avatar, Button, Badge as Chip, Modal as Dialog, IconButton, Card as Paper, Tab, Tabs, Input as TextField } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Autocomplete, Box, CircularProgress, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, Tooltip, Typography } from "@mui/material";
import {
  AddRounded,
  CallRounded,
  CalendarMonthRounded,
  CancelRounded,
  ChatBubbleOutlineRounded,
  CloseRounded,
  EmailRounded,
  GroupsRounded,
  MarkEmailUnreadRounded,
  MicRounded,
  MoreHorizRounded,
  SendRounded,
  SmartToyRounded,
  FormatBoldRounded,
  FormatItalicRounded,
  CodeRounded,
  FormatListBulletedRounded,
  LinkRounded,
  VideoCallRounded,
} from "@mui/icons-material";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate, useSearchParams } from "react-router-dom";
import execReq, { SOCKET_BASE_URL } from "../../lib/execReq";
import useAuthStore from "../../strore/authStore";
import MeetingRoomModal from "./MeetingRoomModal";
import PageHeader from "../../components/common/PageHeader";
import { enableNotificationSound, startRingtone, stopRingtone } from "../../lib/notificationSound";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN");
};

const formatTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

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

const CommunicationHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const token =
    useAuthStore((state) => state.token) ||
    localStorage.getItem("hrms_token") ||
    sessionStorage.getItem("token");
  const userId = getId(user);
  const role = String(user?.role || "employee").toLowerCase();
  const canSeeAllLeaves = [
    "admin",
    "superadmin",
    "super_admin",
    "hr",
    "manager",
  ].includes(role);

  const [tab, setTab] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [calls, setCalls] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [hrBot, setHrBot] = useState(null);
  const [meetingRoom, setMeetingRoom] = useState(null);
  const [reactionMessageId, setReactionMessageId] = useState("");
  const [messageReactions, setMessageReactions] = useState({});
  const [chatSearch, setChatSearch] = useState("");
  const [chatFilter, setChatFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [message, setMessage] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callError, setCallError] = useState("");
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: [],
    description: "",
    meetingType: "online",
    location: "",
  });

  const socketRef = useRef(null);
  const selectedConversationRef = useRef("");
  const selectedContactRef = useRef(null);
  const activeCallRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const typingTimerRef = useRef(null);
  const contactsRef = useRef([]);
  const draftInputRef = useRef(null);
  const incomingCallRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    const unlockAudio = () => enableNotificationSound();
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const activeConversation = useMemo(
    () =>
      conversations.find((item) => getId(item) === selectedConversationId) ||
      null,
    [conversations, selectedConversationId],
  );

  const otherParticipant = useCallback(
    (conversation) =>
      conversation?.participants?.find(
        (participant) => getId(participant) !== userId,
      ) || null,
    [userId],
  );

  const updateConversation = useCallback((conversationId, updater) => {
    setConversations((current) => {
      const next = current.map((item) =>
        getId(item) === String(conversationId) ? updater(item) : item,
      );
      return next.sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.updatedAt || 0) -
          new Date(a.lastMessageAt || a.updatedAt || 0),
      );
    });
  }, []);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        contactResponse,
        conversationResponse,
        meetingResponse,
        callResponse,
        botResponse,
      ] = await Promise.all([
        execReq("/communication/contacts"),
        execReq("/communication/conversations"),
        execReq("/communication/meetings"),
        execReq("/communication/calls"),
        execReq("/chat/hr-bot").catch(() => null),
      ]);
      const nextContacts = contactResponse?.data?.data || [];
      const nextConversations = conversationResponse?.data?.data || [];
      setContacts(nextContacts);
      setHrBot(botResponse?.data?.data || null);
      setConversations(nextConversations);
      setMeetings(meetingResponse?.data?.data || []);
      setCalls(callResponse?.data?.data || []);

      if (!selectedConversationRef.current && nextConversations.length) {
        setSelectedConversationId(getId(nextConversations[0]));
        setSelectedContact(otherParticipant(nextConversations[0]));
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          "Communication data could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [otherParticipant]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    try {
      const response = await execReq(
        `/communication/conversations/${conversationId}/messages`,
      );
      const data = response?.data?.data || [];
      setMessages(data);
      window.dispatchEvent(new Event("hrms:communication-refresh"));
      socketRef.current?.emit("communication:join", conversationId);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Messages could not be loaded.",
      );
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      const conversation = conversations.find(
        (item) => getId(item) === selectedConversationId,
      );
      setSelectedContact(otherParticipant(conversation));
      socketRef.current?.emit("communication:join", selectedConversationId);
    }
  }, [selectedConversationId, conversations, loadMessages, otherParticipant]);

  useEffect(() => {
    const requested = searchParams.get("conversation");
    if (requested && conversations.some((item) => getId(item) === requested)) {
      setSelectedConversationId(requested);
      setTab(1);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    const requestedRoom = searchParams.get("meetingRoom");
    if (!requestedRoom || !token) return;
    let active = true;
    execReq(`/meetings/${encodeURIComponent(requestedRoom)}`)
      .then((response) => {
        if (!active) return;
        setMeetingRoom(response?.data?.data || null);
        setTab(2);
      })
      .catch(() => {
        if (active)
          setMessage("The meeting room is unavailable or you are not invited.");
      });
    return () => {
      active = false;
    };
  }, [searchParams, token]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("communication:message", (incoming) => {
      const conversationId = getId(incoming?.conversation);
      if (!conversationId) return;

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        lastMessageText: incoming.text,
        lastMessageAt: incoming.createdAt,
        lastMessageSender: incoming.sender,
      }));

      if (conversationId === selectedConversationRef.current) {
        setMessages((current) => {
          if (current.some((item) => getId(item) === getId(incoming)))
            return current;
          return [...current, incoming];
        });
        updateConversation(conversationId, (conversation) => ({
          ...conversation,
          unreadCount: 0,
        }));
        execReq.put(`/communication/conversations/${conversationId}/read`)
          .then(() => window.dispatchEvent(new Event("hrms:communication-refresh")))
          .catch(() => {});
      }
    });

    socket.on("communication:typing", (payload) => {
      if (
        payload?.conversationId === selectedConversationRef.current &&
        payload?.userId !== userId
      ) {
        setTyping(Boolean(payload.isTyping));
      }
    });

    socket.on("call:incoming", (payload) => {
      if (activeCallRef.current) {
        socket.emit("call:rejected", {
          toUserId: payload.fromUserId,
          callId: payload.callId,
        });
        return;
      }
      const contact = contactsRef.current.find(
        (item) => getId(item) === String(payload.fromUserId),
      );
      if (incomingCallRef.current?.callId === String(payload.callId)) return;
      setIncomingCall({ ...payload, contact });
      startRingtone();
    });

    socket.on("call:accepted", async (payload) => {
      const call = activeCallRef.current;
      if (!call || call.id !== String(payload.callId)) return;
      try {
        const pc = await createPeerConnection({
          peerId: call.peerId,
          type: call.type,
          callId: call.id,
          ensureMedia: true,
        });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:offer", {
          toUserId: call.peerId,
          callId: call.id,
          type: call.type,
          sdp: offer,
        });
        setActiveCall((current) =>
          current ? { ...current, status: "connecting" } : current,
        );
      } catch (error) {
        setCallError(error?.message || "Could not start the call.");
      }
    });

    socket.on("call:rejected", async (payload) => {
      if (activeCallRef.current?.id === String(payload.callId)) {
        await endCall({ notify: false, status: "rejected" });
        setMessage("Call was declined.");
      }
    });

    socket.on("call:offer", async (payload) => {
      const current = activeCallRef.current;
      if (!current || current.id !== String(payload.callId)) return;
      try {
        const pc = await createPeerConnection({
          peerId: current.peerId,
          type: current.type,
          callId: current.id,
          ensureMedia: true,
        });
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        await flushPendingIce(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call:answer", {
          toUserId: current.peerId,
          callId: current.id,
          type: current.type,
          sdp: answer,
        });
        await execReq.patch(`/communication/calls/${current.id}/status`, {
          status: "accepted",
        });
        setActiveCall((call) =>
          call ? { ...call, status: "connected" } : call,
        );
      } catch (error) {
        setCallError(error?.message || "Could not establish the call.");
      }
    });

    socket.on("call:answer", async (payload) => {
      const current = activeCallRef.current;
      if (
        !current ||
        current.id !== String(payload.callId) ||
        !peerConnectionRef.current
      )
        return;
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(payload.sdp),
        );
        await flushPendingIce(peerConnectionRef.current);
        setActiveCall((call) =>
          call ? { ...call, status: "connected" } : call,
        );
      } catch (error) {
        setCallError(error?.message || "Could not finish the call connection.");
      }
    });

    socket.on("call:ice", async (payload) => {
      const current = activeCallRef.current;
      if (!current || current.id !== String(payload.callId)) return;
      const candidate = new RTCIceCandidate(payload.candidate);
      if (peerConnectionRef.current?.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch {
          pendingIceRef.current.push(candidate);
        }
      } else {
        pendingIceRef.current.push(candidate);
      }
    });

    socket.on("call:end", async (payload) => {
      if (incomingCallRef.current?.callId === String(payload.callId)) {
        stopRingtone();
        setIncomingCall(null);
      }
      if (activeCallRef.current?.id === String(payload.callId)) {
        await endCall({ notify: false, status: "ended" });
      }
    });

    socket.on("meeting:invited", ({ room } = {}) => {
      if (room) {
        const normalizedRoom = {
          _id: `room-${room.roomId}`,
          roomId: room.roomId,
          title: room.title,
          startAt: room.startTime,
          endAt: new Date(
            new Date(room.startTime).getTime() + 60 * 60 * 1000,
          ).toISOString(),
          participants: room.participants || [],
          organizer: room.host || null,
          meetingType: "online",
          meetingLink: `${window.location.origin}/dashboard/communication?meetingRoom=${encodeURIComponent(room.roomId)}`,
          status: "scheduled",
        };
        setMeetings((current) =>
          current.some((item) => item.roomId === room.roomId)
            ? current
            : [normalizedRoom, ...current],
        );
        setMessage(`You were invited to ${room.title || "a meeting"}.`);
      }
    });

    socket.on("connect_error", (error) => {
      setMessage(error?.message || "Communication connection failed.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      stopRingtone();
      cleanupPeerConnection();
    };
  }, [token, userId, updateConversation]);

  const cleanupPeerConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingIceRef.current = [];
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const flushPendingIce = useCallback(async (pc) => {
    const queued = [...pendingIceRef.current];
    pendingIceRef.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Ignore a stale ICE candidate; the connection can continue.
      }
    }
  }, []);

  const createPeerConnection = useCallback(
    async ({ peerId, type, callId, ensureMedia = false }) => {
      if (peerConnectionRef.current) return peerConnectionRef.current;
      if (ensureMedia && !localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video",
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      localStreamRef.current
        ?.getTracks()
        .forEach((track) => pc.addTrack(track, localStreamRef.current));
      pc.ontrack = (event) => {
        const stream = event.streams?.[0];
        if (remoteVideoRef.current && stream)
          remoteVideoRef.current.srcObject = stream;
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("call:ice", {
            toUserId: peerId,
            callId,
            type,
            candidate: event.candidate,
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          setActiveCall((current) =>
            current ? { ...current, status: pc.connectionState } : current,
          );
        }
      };
      peerConnectionRef.current = pc;
      return pc;
    },
    [],
  );

  const startConversation = async (contact) => {
    if (!contact?._id) return;
    try {
      const response = await execReq.post("/communication/conversations", {
        participantId: contact._id,
      });
      const conversation = response?.data?.data;
      if (!conversation) return;
      setConversations((current) => [
        conversation,
        ...current.filter((item) => getId(item) !== getId(conversation)),
      ]);
      setSelectedConversationId(getId(conversation));
      setSelectedContact(contact);
      setTab(1);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Could not start the conversation.",
      );
    }
  };

  const sendChat = async () => {
    const text = draft.trim();
    if (!text) return;

    // @HR Bot works even before a conversation has been selected.
    if (!selectedConversationId && /^@HR\s*Bot\b/i.test(text)) {
      try {
        const response = await execReq.post("/chat/hr-bot", { text });
        const result = response?.data?.data;
        if (result?.conversationId) {
          const botConversation = {
            _id: result.conversationId,
            title: "HR Bot",
            type: "direct",
            participants: [user, hrBot].filter(Boolean),
            lastMessageText: result.answer || "HR Bot response",
            lastMessageAt: new Date().toISOString(),
            lastMessageSender: hrBot,
          };
          setConversations((current) => [
            botConversation,
            ...current.filter((item) => getId(item) !== result.conversationId),
          ]);
          setSelectedConversationId(result.conversationId);
          setSelectedContact(hrBot);
          setMessages(result.messages || []);
          setTab(1);
        }
        setDraft("");
        return;
      } catch (error) {
        setMessage(
          error?.response?.data?.message || "HR Bot is currently unavailable.",
        );
        return;
      }
    }

    if (!selectedConversationId) return;
    try {
      const response = await execReq.post(
        `/communication/conversations/${selectedConversationId}/messages`,
        { text },
      );
      const sent = response?.data?.data;
      if (sent) {
        setMessages((current) =>
          current.some((item) => getId(item) === getId(sent))
            ? current
            : [...current, sent],
        );
        updateConversation(selectedConversationId, (conversation) => ({
          ...conversation,
          lastMessageText: sent.text,
          lastMessageAt: sent.createdAt,
          lastMessageSender: sent.sender,
        }));
      }
      const botResponse = response?.data?.botResponse;
      if (botResponse) {
        setMessages((current) =>
          current.some((item) => getId(item) === getId(botResponse))
            ? current
            : [...current, botResponse],
        );
        updateConversation(selectedConversationId, (conversation) => ({
          ...conversation,
          lastMessageText: botResponse.text,
          lastMessageAt: botResponse.createdAt,
          lastMessageSender: botResponse.sender,
        }));
      }
      setDraft("");
      socketRef.current?.emit("communication:typing", {
        conversationId: selectedConversationId,
        isTyping: false,
      });
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Message could not be sent.",
      );
    }
  };

  const handleDraftChange = (event) => {
    const next = event.target.value;
    setDraft(next);
    if (!selectedConversationId) return;
    socketRef.current?.emit("communication:typing", {
      conversationId: selectedConversationId,
      isTyping: Boolean(next.trim()),
    });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("communication:typing", {
        conversationId: selectedConversationId,
        isTyping: false,
      });
    }, 900);
  };

  const insertMarkdown = (before, after = before, placeholder = "text") => {
    const input = draftInputRef.current;
    if (!input) {
      setDraft(
        (current) =>
          `${before}${placeholder}${after}${current ? ` ${current}` : ""}`,
      );
      return;
    }
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? draft.length;
    const selected = draft.slice(start, end) || placeholder;
    const next = `${draft.slice(0, start)}${before}${selected}${after}${draft.slice(end)}`;
    setDraft(next);
    requestAnimationFrame(() => {
      input.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selected.length;
      input.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const toggleReaction = (messageId, emoji) => {
    setMessageReactions((current) => {
      const existing = current[messageId] || {};
      return {
        ...current,
        [messageId]: {
          ...existing,
          [emoji]: existing[emoji] ? existing[emoji] + 1 : 1,
        },
      };
    });
    setReactionMessageId("");
  };

  const createMeeting = async () => {
    if (
      !meetingForm.title.trim() ||
      !meetingForm.date ||
      !meetingForm.startTime ||
      !meetingForm.endTime
    ) {
      setMessage("Meeting title, date, start time and end time are required.");
      return;
    }
    const startAt = new Date(`${meetingForm.date}T${meetingForm.startTime}`);
    const endAt = new Date(`${meetingForm.date}T${meetingForm.endTime}`);
    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      setMessage("Please provide a valid meeting time range.");
      return;
    }

    setSavingMeeting(true);
    try {
      const response = await execReq.post("/communication/meetings", {
        title: meetingForm.title,
        description: meetingForm.description,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        participantIds: meetingForm.participants
          .map((item) => getId(item))
          .filter(Boolean),
        meetingType: meetingForm.meetingType,
        location: meetingForm.location,
      });
      if (response?.data?.data)
        setMeetings((current) => [response.data.data, ...current]);
      setMeetingForm({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        participants: [],
        description: "",
        meetingType: "online",
        location: "",
      });
      setMessage("Meeting scheduled successfully.");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Meeting could not be scheduled.",
      );
    } finally {
      setSavingMeeting(false);
    }
  };

  const cancelMeeting = async (meetingId) => {
    try {
      const response = await execReq.patch(
        `/communication/meetings/${meetingId}/cancel`,
      );
      if (response?.data?.data) {
        setMeetings((current) =>
          current.map((meeting) =>
            getId(meeting) === String(meetingId) ? response.data.data : meeting,
          ),
        );
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Meeting could not be cancelled.",
      );
    }
  };

  const startCall = async (type) => {
    const contact = selectedContactRef.current;
    if (!contact?._id) {
      setMessage("Select a colleague before starting a call.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCallError("Browser media access is unavailable in this environment.");
      return;
    }
    setCallError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const response = await execReq.post("/communication/calls", {
        calleeId: contact._id,
        type,
      });
      const call = response?.data?.data;
      if (!call?._id) throw new Error("Call session could not be created.");
      const next = {
        id: String(call._id),
        peerId: getId(contact),
        peerName: contact.name,
        type,
        role: "caller",
        status: "ringing",
      };
      activeCallRef.current = next;
      setActiveCall(next);
      socketRef.current?.emit("call:invite", {
        toUserId: contact._id,
        callId: String(call._id),
        type,
      });
    } catch (error) {
      localStreamRef.current?.getTracks?.().forEach((track) => track.stop());
      localStreamRef.current = null;
      setCallError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start call. Check microphone/camera permissions.",
      );
    }
  };

  // const acceptIncomingCall = async () => {
  //   const call = incomingCall;
  //   if (!call) return;
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.type === "video" });
  //     localStreamRef.current = stream;
  //     if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  //     setActiveCall({
  //       id: String(call.callId),
  //       peerId: String(call.fromUserId),
  //       peerName: call.contact?.name || "Colleague",
  //       type: call.type,
  //       role: "callee",
  //       status: "connecting",
  //     });
  //     setIncomingCall(null);
  //     socketRef.current?.emit("call:accepted", { toUserId: call.fromUserId, callId: call.callId });
  //     await execReq.patch(`/communication/calls/${call.callId}/status`, { status: "accepted" });
  //   } catch (error) {
  //     setCallError(error?.message || "Unable to accept the call. Check device permissions.");
  //   }
  // };
  const acceptIncomingCall = async () => {
    const call = incomingCall;
    if (!call) return;
    stopRingtone();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone/camera access is unavailable. Use HTTPS or localhost for WebRTC media access.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: call.type === "video",
      });

      localStreamRef.current = stream;

      const nextCall = {
        id: String(call.callId),
        peerId: String(call.fromUserId),
        peerName: call.contact?.name || "Colleague",
        type: call.type,
        role: "callee",
        status: "connecting",
      };

      // Set the ref immediately before emitting call:accepted.
      // This prevents the caller's offer from arriving while activeCallRef
      // is still null because React state updates are asynchronous.
      activeCallRef.current = nextCall;
      setActiveCall(nextCall);
      setIncomingCall(null);
      setCallError("");

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socketRef.current?.emit("call:accepted", {
        toUserId: call.fromUserId,
        callId: call.callId,
      });

      await execReq.patch(`/communication/calls/${call.callId}/status`, {
        status: "accepted",
      });
    } catch (error) {
      console.error("ACCEPT CALL ERROR:", error);

      localStreamRef.current?.getTracks?.().forEach((track) => track.stop());
      localStreamRef.current = null;
      activeCallRef.current = null;

      setCallError(
        error?.name
          ? `${error.name}: ${
              error.message || "Unable to access microphone/camera."
            }`
          : error?.message || "Unable to accept the call.",
      );
    }
  };

  useEffect(() => {
    if (activeCall && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [activeCall]);

  const rejectIncomingCall = async () => {
    const call = incomingCall;
    if (!call) return;
    stopRingtone();
    socketRef.current?.emit("call:rejected", {
      toUserId: call.fromUserId,
      callId: call.callId,
    });
    try {
      await execReq.patch(`/communication/calls/${call.callId}/status`, {
        status: "rejected",
      });
    } catch {
      // The caller still receives the socket rejection.
    }
    setIncomingCall(null);
  };

  const endCall = useCallback(
    async ({ notify = true, status = "ended" } = {}) => {
      const call = activeCallRef.current;
      if (!call) return;
      stopRingtone();
      if (notify)
        socketRef.current?.emit("call:end", {
          toUserId: call.peerId,
          callId: call.id,
        });
      try {
        await execReq.patch(`/communication/calls/${call.id}/status`, {
          status,
        });
      } catch {
        // Keep cleanup reliable even if the log update fails.
      }
      cleanupPeerConnection();
      setActiveCall(null);
      setCallError("");
      try {
        const response = await execReq("/communication/calls");
        setCalls(response?.data?.data || []);
      } catch {
        // Call history refresh is non-critical.
      }
    },
    [cleanupPeerConnection],
  );

  const visibleConversations = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const person = otherParticipant(conversation);
      const matchesFilter =
        chatFilter === "unread" ? Number(conversation.unreadCount) > 0 : true;
      const haystack = [
        person?.name,
        person?.email,
        conversation.title,
        conversation.lastMessageText,
      ].map((value) => String(value || "").toLowerCase());
      return (
        matchesFilter && (!q || haystack.some((value) => value.includes(q)))
      );
    });
  }, [conversations, chatFilter, chatSearch, otherParticipant]);

  const selectedChatName =
    selectedContact?.name ||
    otherParticipant(activeConversation)?.name ||
    "Select a colleague";

  return (
    <Box sx={{ minHeight: "100%" }}>
      <PageHeader title="Communication" />
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="flex-end"
        alignItems={{ md: "center" }}
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="flex-end"
        >
          {hrBot ? (
            <Button
              variant="outlined"
              startIcon={<SmartToyRounded />}
              onClick={() => startConversation(hrBot)}
            >
              HR Bot
            </Button>
          ) : null}
          <Autocomplete
            size="small"
            options={contacts}
            getOptionLabel={(option) =>
              `${option.name || "User"}${option.email ? ` · ${option.email}` : ""}`
            }
            value={null}
            onChange={(_, value) => value && startConversation(value)}
            sx={{ width: { xs: "100%", sm: 290 } }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Start a new chat" />
            )}
          />
          <Button
            variant="outlined"
            startIcon={<AddRounded />}
            onClick={() => setTab(0)}
          >
            Compose mail
          </Button>
        </Stack>
      </Stack>

      {message ? (
        <Alert
          severity="info"
          onClose={() => setMessage("")}
          sx={{ mb: 2, borderRadius: "4px" }}
        >
          {message}
        </Alert>
      ) : null}

      <Paper
        sx={{
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid " + themeColors.border,
          boxShadow:
            "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
          background: themeColors.cardBg,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            px: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: themeColors.hover,
            "& .MuiTab-root": {
              minHeight: 50,
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab
            icon={<EmailRounded fontSize="small" />}
            iconPosition="start"
            label="Mail"
          />
          <Tab
            icon={<ChatBubbleOutlineRounded fontSize="small" />}
            iconPosition="start"
            label="Chat"
          />
          <Tab
            icon={<CalendarMonthRounded fontSize="small" />}
            iconPosition="start"
            label="Meetings"
          />
          <Tab
            icon={<CallRounded fontSize="small" />}
            iconPosition="start"
            label="Calls"
          />
        </Tabs>

        {tab === 1 && (
          <Grid container sx={{ minHeight: { xs: "auto", md: 590 } }}>
            <Grid
              item
              xs={12}
              md={3.2}
              sx={{
                borderRight: { md: "1px solid" },
                borderColor: "divider",
                bgcolor: themeColors.hover,
              }}
            >
              <Box sx={{ p: 1.25, background: themeColors.cardBg }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: themeColors.secondaryDark,
                    letterSpacing: 0.3,
                    mb: 1,
                  }}
                >
                  MESSAGES
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  placeholder="Search conversations"
                  InputProps={{
                    startAdornment: (
                      <Box
                        component="span"
                        sx={{ display: "inline-flex", mr: 0.7, color: "none" }}
                      >
                        ⌕
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      bgcolor: themeColors.cardBg,
                    },
                  }}
                />
                <Stack
                  direction="row"
                  spacing={0.6}
                  sx={{ mt: 1 }}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Button
                    size="small"
                    onClick={() => setChatFilter("all")}
                    sx={{
                      minWidth: 0,
                      px: 1.1,
                      py: 0.35,
                      textTransform: "none",
                      borderRadius: "4px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: chatFilter === "all" ? themeColors.secondaryDark : themeColors.textMuted,
                      bgcolor: chatFilter === "all" ? themeColors.primarySoft : "transparent",
                    }}
                  >
                    All
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setChatFilter("unread")}
                    sx={{
                      minWidth: 0,
                      px: 1.1,
                      py: 0.35,
                      textTransform: "none",
                      borderRadius: "4px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: chatFilter === "unread" ? themeColors.secondaryDark : themeColors.textMuted,
                      bgcolor:
                        chatFilter === "unread" ? themeColors.primarySoft : "transparent",
                    }}
                  >
                    Unread
                  </Button>
                </Stack>
              </Box>
              <Divider />
              {loading ? (
                <Box sx={{ display: "grid", placeItems: "center", p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : null}
              {!loading && visibleConversations.length
                ? visibleConversations.map((conversation) => {
                    const person = otherParticipant(conversation);
                    return (
                      <Box
                        key={getId(conversation)}
                        onClick={() =>
                          setSelectedConversationId(getId(conversation))
                        }
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          bgcolor:
                            getId(conversation) === selectedConversationId
                              ? themeColors.overlay21
                              : "transparent",
                          "&:hover": { bgcolor: themeColors.overlay22 },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Avatar
                            src={person?.avatar || undefined}
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: "primary.main",
                              fontSize: 13,
                            }}
                          >
                            {String(person?.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>
                          <Box minWidth={0} flex={1}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              gap={1}
                            >
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  fontWeight: conversation.unreadCount
                                    ? 800
                                    : 700,
                                }}
                                noWrap
                              >
                                {person?.name ||
                                  conversation.title ||
                                  "Conversation"}
                              </Typography>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.6}
                              >
                                <Typography
                                  sx={{ fontSize: 10, color: "text.secondary" }}
                                >
                                  {conversation.lastMessageAt
                                    ? formatTime(conversation.lastMessageAt)
                                    : ""}
                                </Typography>
                                {conversation.unreadCount ? (
                                  <Box
                                    sx={{
                                      minWidth: 17,
                                      height: 17,
                                      px: 0.4,
                                      borderRadius: "4px",
                                      bgcolor: themeColors.primary,
                                      color: themeColors.cardBg,
                                      display: "grid",
                                      placeItems: "center",
                                      fontSize: 9,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {conversation.unreadCount > 99
                                      ? "99+"
                                      : conversation.unreadCount}
                                  </Box>
                                ) : null}
                              </Stack>
                            </Stack>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "text.secondary",
                                fontWeight: conversation.unreadCount
                                  ? 700
                                  : 400,
                              }}
                              noWrap
                            >
                              {conversation.lastMessageText ||
                                person?.department ||
                                person?.role ||
                                "No messages yet"}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })
                : null}
              {!loading && !visibleConversations.length ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <GroupsRounded
                    sx={{ fontSize: 36, color: "text.disabled" }}
                  />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 1 }}>
                    {chatFilter === "unread"
                      ? "No unread conversations"
                      : chatSearch
                        ? "No matching conversations"
                        : "No conversations yet"}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}
                  >
                    {chatFilter === "unread"
                      ? "You're all caught up."
                      : "Choose a colleague above to start a chat."}
                  </Typography>
                </Box>
              ) : null}
            </Grid>
            <Grid
              item
              xs={12}
              md={8.8}
              sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                gap={1}
                sx={{
                  p: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: themeColors.cardBg,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                  minWidth={0}
                >
                  <Avatar
                    src={selectedContact?.avatar || undefined}
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: "primary.main",
                      fontSize: 12,
                    }}
                  >
                    {String(selectedChatName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }} noWrap>
                      {selectedChatName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      {typing
                        ? "typing…"
                        : selectedContact?.email || selectedContact?.role || ""}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Audio call">
                    <IconButton
                      size="small"
                      onClick={() => startCall("audio")}
                      disabled={!selectedContact}
                    >
                      <CallRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Video call">
                    <IconButton
                      size="small"
                      onClick={() => startCall("video")}
                      disabled={!selectedContact}
                    >
                      <VideoCallRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More">
                    <IconButton size="small">
                      <MoreHorizRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Box
                sx={{
                  flex: 1,
                  p: { xs: 1.5, md: 2.5 },
                  overflowY: "auto",
                  minHeight: 440,
                  maxHeight: 440,
                  bgcolor: themeColors.hover,
                }}
              >
                {messagesLoading ? (
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : null}
                {!messagesLoading && !messages.length ? (
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      height: "100%",
                      textAlign: "center",
                    }}
                  >
                    <ChatBubbleOutlineRounded
                      sx={{ fontSize: 44, color: "primary.light" }}
                    />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 1 }}>
                      Start the conversation
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}
                    >
                      Messages are stored securely in the HRMS database.
                    </Typography>
                  </Box>
                ) : null}
                {!messagesLoading &&
                  messages.map((item) => {
                    const mine = getId(item.sender) === userId;
                    const messageId = getId(item);
                    const reactions = messageReactions[messageId] || {};
                    return (
                      <Box
                        key={messageId}
                        onMouseEnter={() => setReactionMessageId(messageId)}
                        onMouseLeave={() => setReactionMessageId("")}
                        sx={{
                          mb: 1.7,
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: { xs: "88%", md: "72%" },
                            position: "relative",
                          }}
                        >
                          {reactionMessageId === messageId ? (
                            <Paper
                              sx={{
                                position: "absolute",
                                right: mine ? 0 : "auto",
                                left: mine ? "auto" : 0,
                                top: -36,
                                zIndex: 3,
                                display: "flex",
                                gap: 0.25,
                                p: 0.35,
                                borderRadius: "4px",
                                boxShadow:
                                  "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,
                                border: "1px solid " + themeColors.border,
                              }}
                            >
                              {["👍", "❤️", "🚀", "💡"].map((emoji) => (
                                <IconButton
                                  key={emoji}
                                  size="small"
                                  onClick={() =>
                                    toggleReaction(messageId, emoji)
                                  }
                                  sx={{ width: 30, height: 30, fontSize: 17 }}
                                >
                                  {emoji}
                                </IconButton>
                              ))}
                            </Paper>
                          ) : null}
                          <Paper
                            sx={{
                              p: 1.35,
                              bgcolor: mine ? themeColors.primarySoft : themeColors.cardBg,
                              border: "1px solid",
                              borderColor: mine ? themeColors.border : "divider",
                              boxShadow: "none",
                            }}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      lineHeight: 1.65,
                                      wordBreak: "break-word",
                                      mb: 0.65,
                                      "&:last-child": { mb: 0 },
                                    }}
                                  >
                                    {children}
                                  </Typography>
                                ),
                                strong: ({ children }) => (
                                  <Box
                                    component="strong"
                                    sx={{ fontWeight: 800 }}
                                  >
                                    {children}
                                  </Box>
                                ),
                                code: ({ children }) => (
                                  <Box
                                    component="code"
                                    sx={{
                                      px: 0.5,
                                      py: 0.1,
                                      borderRadius: "4px",
                                      bgcolor: themeColors.overlay1,
                                      fontFamily: "monospace",
                                      fontSize: 12,
                                    }}
                                  >
                                    {children}
                                  </Box>
                                ),
                                pre: ({ children }) => (
                                  <Box
                                    component="pre"
                                    sx={{
                                      p: 1,
                                      borderRadius: "4px",
                                      bgcolor: themeColors.navyDark,
                                      color: themeColors.border,
                                      overflowX: "auto",
                                      fontSize: 12,
                                      fontFamily: "monospace",
                                      my: 0.75,
                                    }}
                                  >
                                    {children}
                                  </Box>
                                ),
                                a: ({ href, children }) => (
                                  <Box
                                    component="a"
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{
                                      color: themeColors.secondaryDark,
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {children}
                                  </Box>
                                ),
                                ul: ({ children }) => (
                                  <Box
                                    component="ul"
                                    sx={{ pl: 2.5, mb: 0.75, mt: 0.5 }}
                                  >
                                    {children}
                                  </Box>
                                ),
                                ol: ({ children }) => (
                                  <Box
                                    component="ol"
                                    sx={{ pl: 2.5, mb: 0.75, mt: 0.5 }}
                                  >
                                    {children}
                                  </Box>
                                ),
                                li: ({ children }) => (
                                  <Box
                                    component="li"
                                    sx={{ fontSize: 13, lineHeight: 1.6 }}
                                  >
                                    {children}
                                  </Box>
                                ),
                              }}
                            >
                              {String(item.text || "")}
                            </ReactMarkdown>
                          </Paper>
                          {Object.keys(reactions).length ? (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ mt: 0.5, flexWrap: "wrap" }}
                            >
                              {Object.entries(reactions).map(
                                ([emoji, count]) => (
                                  <Chip
                                    key={emoji}
                                    label={`${emoji} ${count}`}
                                    size="small"
                                    sx={{
                                      borderRadius: "4px",
                                      height: 22,
                                      fontSize: 10,
                                    }}
                                  />
                                ),
                              )}
                            </Stack>
                          ) : null}
                          <Typography
                            sx={{
                              fontSize: 10,
                              color: "text.secondary",
                              mt: 0.4,
                              textAlign: mine ? "right" : "left",
                            }}
                          >
                            {mine ? "You" : item.sender?.name || "Colleague"} ·{" "}
                            {formatTime(item.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>

              <Box
                sx={{
                  p: 1.2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: themeColors.cardBg,
                }}
              >
                <Stack direction="row" spacing={0.25} sx={{ mb: 0.6 }}>
                  <Tooltip title="Bold">
                    <IconButton
                      size="small"
                      onClick={() => insertMarkdown("**", "**", "bold text")}
                    >
                      <FormatBoldRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Italic">
                    <IconButton
                      size="small"
                      onClick={() => insertMarkdown("*", "*", "italic text")}
                    >
                      <FormatItalicRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Code block">
                    <IconButton
                      size="small"
                      onClick={() => insertMarkdown("```\n", "\n```", "code")}
                    >
                      <CodeRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bullet list">
                    <IconButton
                      size="small"
                      onClick={() => insertMarkdown("- ", "", "list item")}
                    >
                      <FormatListBulletedRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Link">
                    <IconButton
                      size="small"
                      onClick={() =>
                        insertMarkdown("[", "](https://)", "link text")
                      }
                    >
                      <LinkRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    inputRef={draftInputRef}
                    fullWidth
                    size="small"
                    multiline
                    maxRows={5}
                    value={draft}
                    onChange={handleDraftChange}
                    disabled={!selectedConversationId}
                    placeholder={
                      selectedConversationId
                        ? "Write a message… Markdown is supported"
                        : "Select a conversation"
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendChat();
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={sendChat}
                    disabled={!draft.trim() || !selectedConversationId}
                    aria-label="Send message"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "4px",
                      bgcolor: "primary.light",
                    }}
                  >
                    <SendRounded />
                  </IconButton>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: 590 }}>
            <Grid container spacing={2.5} alignItems="stretch">
              <Grid item xs={12} lg={5}>
                <Paper
                  sx={{
                    p: 2.5,
                    height: "100%",
                    borderRadius: "4px",
                    border: "1px solid " + themeColors.border,
                    background:
                      themeColors.primarySoft,
                    boxShadow: "none",
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                    Schedule meeting
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}
                  >
                    Create a meeting and invite colleagues from the HRMS
                    directory.
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Meeting title"
                      value={meetingForm.title}
                      onChange={(e) =>
                        setMeetingForm((current) => ({
                          ...current,
                          title: e.target.value,
                        }))
                      }
                    />
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.2}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={meetingForm.date}
                        onChange={(e) =>
                          setMeetingForm((current) => ({
                            ...current,
                            date: e.target.value,
                          }))
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="time"
                        label="Start"
                        InputLabelProps={{ shrink: true }}
                        value={meetingForm.startTime}
                        onChange={(e) =>
                          setMeetingForm((current) => ({
                            ...current,
                            startTime: e.target.value,
                          }))
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="time"
                        label="End"
                        InputLabelProps={{ shrink: true }}
                        value={meetingForm.endTime}
                        onChange={(e) =>
                          setMeetingForm((current) => ({
                            ...current,
                            endTime: e.target.value,
                          }))
                        }
                      />
                    </Stack>
                    <Autocomplete
                      multiple
                      options={contacts}
                      value={meetingForm.participants}
                      onChange={(_, value) =>
                        setMeetingForm((current) => ({
                          ...current,
                          participants: value,
                        }))
                      }
                      getOptionLabel={(option) =>
                        `${option.name || "User"}${option.email ? ` · ${option.email}` : ""}`
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Participants"
                          placeholder="Select colleagues"
                        />
                      )}
                    />
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.2}
                    >
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Meeting type"
                        value={meetingForm.meetingType}
                        onChange={(e) =>
                          setMeetingForm((current) => ({
                            ...current,
                            meetingType: e.target.value,
                          }))
                        }
                        SelectProps={{ native: true }}
                      >
                        <option value="online">Online</option>
                        <option value="in-person">In person</option>
                      </TextField>
                      <TextField
                        fullWidth
                        size="small"
                        label={
                          meetingForm.meetingType === "online"
                            ? "Location / note"
                            : "Location"
                        }
                        value={meetingForm.location}
                        onChange={(e) =>
                          setMeetingForm((current) => ({
                            ...current,
                            location: e.target.value,
                          }))
                        }
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      size="small"
                      label="Description"
                      value={meetingForm.description}
                      onChange={(e) =>
                        setMeetingForm((current) => ({
                          ...current,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="contained"
                      startIcon={
                        savingMeeting ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <CalendarMonthRounded />
                        )
                      }
                      onClick={createMeeting}
                      disabled={savingMeeting}
                      sx={{ borderRadius: "4px", alignSelf: "flex-start" }}
                    >
                      Schedule meeting
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={7}>
                <Box sx={{ height: "100%" }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.2 }}>
                    Upcoming meetings
                  </Typography>
                  <Stack
                    spacing={1.2}
                    sx={{ maxHeight: 505, overflowY: "auto", pr: 0.5 }}
                  >
                    {meetings.filter(
                      (meeting) => meeting.status !== "cancelled",
                    ).length ? (
                      meetings
                        .filter((meeting) => meeting.status !== "cancelled")
                        .map((meeting) => (
                          <Paper
                            key={getId(meeting)}
                            sx={{
                              p: 1.75,
                              borderRadius: "4px",
                              border: "1px solid " + themeColors.border,
                              boxShadow: "none",
                              background: themeColors.cardBg,
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={2}
                            >
                              <Box minWidth={0}>
                                <Typography
                                  sx={{ fontSize: 14, fontWeight: 700 }}
                                  noWrap
                                >
                                  {meeting.title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.secondary",
                                    mt: 0.4,
                                  }}
                                >
                                  {formatDate(meeting.startAt)} →{" "}
                                  {formatTime(meeting.endAt)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "text.secondary",
                                    mt: 0.5,
                                  }}
                                >
                                  {meeting.participants?.length
                                    ? `${meeting.participants.length} participant${meeting.participants.length > 1 ? "s" : ""}`
                                    : "Only organizer"}{" "}
                                  · {meeting.meetingType}
                                </Typography>
                                {meeting.meetingLink ? (
                                  <Typography
                                    component="a"
                                    href={meeting.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{
                                      fontSize: 11,
                                      color: "primary.main",
                                      display: "inline-block",
                                      mt: 0.4,
                                      textDecoration: "none",
                                    }}
                                  >
                                    Open meeting workspace
                                  </Typography>
                                ) : null}
                              </Box>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                {meeting.roomId ? (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => setMeetingRoom(meeting)}
                                    sx={{
                                      minWidth: 66,
                                      borderRadius: "4px",
                                      textTransform: "none",
                                      fontSize: 11,
                                    }}
                                  >
                                    Join
                                  </Button>
                                ) : null}
                                {getId(meeting.organizer) === userId ? (
                                  <Tooltip title="Cancel meeting">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        cancelMeeting(getId(meeting))
                                      }
                                    >
                                      <CancelRounded fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Chip
                                    label="Invited"
                                    size="small"
                                    color="info"
                                    sx={{ borderRadius: "4px" }}
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Paper>
                        ))
                    ) : (
                      <Paper
                        sx={{
                          p: 5,
                          borderRadius: "4px",
                          textAlign: "center",
                          border: "1px solid " + themeColors.border,
                          boxShadow: "none",
                        }}
                      >
                        <GroupsRounded
                          sx={{ color: "text.disabled", fontSize: 38 }}
                        />
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 700, mt: 1 }}
                        >
                          No upcoming meetings
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          Scheduled meetings will appear here.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {tab === 3 && (
          <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: 590 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: "4px",
                    border: "1px solid " + themeColors.border,
                    background: themeColors.primarySoft,
                    boxShadow: "none",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: themeColors.overlay23,
                        color: "primary.main",
                      }}
                    >
                      <MicRounded />
                    </Avatar>
                    <Box flex={1}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        Audio calling
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}
                      >
                        Peer-to-peer voice call using authenticated WebRTC
                        signaling.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<CallRounded />}
                      onClick={() => startCall("audio")}
                      disabled={!selectedContact}
                      sx={{ borderRadius: "4px" }}
                    >
                      Call
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: "4px",
                    border: "1px solid " + themeColors.border,
                    background: themeColors.primarySoft,
                    boxShadow: "none",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: themeColors.overlay24,
                        color: themeColors.info,
                      }}
                    >
                      <VideoCallRounded />
                    </Avatar>
                    <Box flex={1}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        Video calling
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}
                      >
                        Peer-to-peer video call with microphone/camera controls
                        through the browser.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<VideoCallRounded />}
                      onClick={() => startCall("video")}
                      disabled={!selectedContact}
                      sx={{ borderRadius: "4px" }}
                    >
                      Call
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.2 }}>
                  Recent calls
                </Typography>
                {calls.length ? (
                  calls.slice(0, 12).map((call) => {
                    const mine = getId(call.caller) === userId;
                    const peer = mine ? call.callee : call.caller;
                    return (
                      <Stack
                        key={getId(call)}
                        direction="row"
                        alignItems="center"
                        gap={1.2}
                        sx={{
                          py: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor:
                              call.type === "video" ? themeColors.infoSoft : themeColors.primarySoft,
                            color:
                              call.type === "video"
                                ? themeColors.info
                                : "primary.main",
                          }}
                        >
                          {call.type === "video" ? (
                            <VideoCallRounded fontSize="small" />
                          ) : (
                            <CallRounded fontSize="small" />
                          )}
                        </Avatar>
                        <Box flex={1}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                            {mine ? "Outgoing" : "Incoming"} {call.type} call ·{" "}
                            {peer?.name || peer?.email || "Colleague"}
                          </Typography>
                          <Typography
                            sx={{ fontSize: 11, color: "text.secondary" }}
                          >
                            {formatDate(call.createdAt)} · {call.status}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={call.status}
                          sx={{
                            borderRadius: "4px",
                            textTransform: "capitalize",
                          }}
                        />
                      </Stack>
                    );
                  })
                ) : (
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    No recent calls.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {tab === 0 && (
          <MailPanel
            user={user}
            canSeeAllLeaves={canSeeAllLeaves}
            navigate={navigate}
          />
        )}
      </Paper>

      <Dialog
        open={Boolean(incomingCall)}
        onClose={rejectIncomingCall}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle sx={{ fontSize: 18, fontWeight: 700 }}>
          Incoming {incomingCall?.type === "video" ? "video" : "audio"} call
        </DialogTitle>
        <DialogContent>
          <Stack alignItems="center" spacing={1.2} sx={{ py: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                fontSize: 22,
              }}
            >
              {String(incomingCall?.contact?.name || "C")
                .charAt(0)
                .toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {incomingCall?.contact?.name || "Colleague"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              is calling you in HRMS
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={rejectIncomingCall}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: "4px" }}
          >
            Decline
          </Button>
          <Button
            onClick={acceptIncomingCall}
            variant="contained"
            startIcon={<CallRounded />}
            sx={{ borderRadius: "4px" }}
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(activeCall)}
        onClose={() => endCall()}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: "4px", overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <span>
            {activeCall?.type === "video" ? "Video call" : "Audio call"} ·{" "}
            {activeCall?.peerName || "Colleague"}
          </span>
          <IconButton size="small" onClick={() => endCall()}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: themeColors.secondaryDark, p: 1.5 }}>
          {callError ? (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: "4px" }}>
              {callError}
            </Alert>
          ) : null}
          <Box
            sx={{
              position: "relative",
              minHeight: 420,
              display: "grid",
              placeItems: "center",
              borderRadius: "4px",
              overflow: "hidden",
              background: themeColors.secondaryDark,
            }}
          >
            {activeCall?.type === "video" ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    height: 420,
                    objectFit: "cover",
                    background: themeColors.textPrimary,
                  }}
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    position: "absolute",
                    width: 180,
                    height: 120,
                    right: 16,
                    bottom: 16,
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid " + themeColors.overlay25,
                    background: themeColors.secondaryDark,
                  }}
                />
              </>
            ) : (
              <>
                <Box sx={{ textAlign: "center", color: themeColors.cardBg }}>
                  <Avatar
                    sx={{
                      mx: "auto",
                      width: 76,
                      height: 76,
                      bgcolor: themeColors.overlay26,
                      fontSize: 26,
                    }}
                  >
                    {String(activeCall?.peerName || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                  <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 700 }}>
                    {activeCall?.peerName || "Colleague"}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12,
                      color: themeColors.overlay27,
                    }}
                  >
                    {activeCall?.status || "connecting"}
                  </Typography>
                </Box>
                <audio ref={remoteVideoRef} autoPlay />
              </>
            )}
          </Box>
          <Stack
            direction="row"
            justifyContent="center"
            spacing={1.2}
            sx={{ pt: 1.5 }}
          >
            <IconButton
              onClick={() => endCall()}
              sx={{
                bgcolor: themeColors.primary,
                color: themeColors.cardBg,
                "&:hover": { bgcolor: themeColors.primary },
              }}
            >
              <CallRounded />
            </IconButton>
          </Stack>
        </DialogContent>
      </Dialog>

      <MeetingRoomModal
        open={Boolean(meetingRoom)}
        meeting={meetingRoom}
        token={token}
        currentUser={user}
        onClose={() => setMeetingRoom(null)}
      />
    </Box>
  );
};

const MailPanel = ({ user, canSeeAllLeaves, navigate }) => {
  const [mails, setMails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ to: "", subject: "", body: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await execReq(
          canSeeAllLeaves ? "/leaves?limit=20" : "/leaves/my",
        );
        const rows = response?.data?.data || [];
        if (!mounted) return;
        setMails(
          rows.map((leave) => ({
            id: `leave-${leave._id}`,
            kind: "leave",
            subject: `Leave request · ${String(leave.leaveType || "Leave").replace(/^./, (c) => c.toUpperCase())}`,
            sender: canSeeAllLeaves
              ? leave.employee?.fullName || "Employee"
              : "HRMS Leave Workflow",
            recipient: canSeeAllLeaves ? "You / Approver" : user?.email,
            date: leave.createdAt || leave.fromDate,
            status: leave.status,
            body: `Leave request from ${leave.fromDate ? new Date(leave.fromDate).toLocaleDateString("en-IN") : "—"} to ${leave.toDate ? new Date(leave.toDate).toLocaleDateString("en-IN") : "—"}. Reason: ${leave.reason || "No reason provided."}`,
          })),
        );
      } catch {
        setMails([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [canSeeAllLeaves, user?.email]);

  const sentMails = useMemo(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("hrms_communication_sent") || "[]",
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }, [composeOpen]);

  const allMails = [...mails, ...sentMails].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const sendMail = () => {
    if (!form.to.trim() || !form.subject.trim() || !form.body.trim()) {
      setNotice("Recipient, subject and message are required.");
      return;
    }
    try {
      const current = JSON.parse(
        localStorage.getItem("hrms_communication_sent") || "[]",
      );
      localStorage.setItem(
        "hrms_communication_sent",
        JSON.stringify([
          {
            ...form,
            id: Date.now(),
            sender: user?.email || "You",
            date: new Date().toISOString(),
          },
          ...(Array.isArray(current) ? current : []),
        ]),
      );
      setNotice(
        "Internal message saved to Sent. External email delivery is not claimed.",
      );
    } catch {
      setNotice("Message could not be saved.");
    }
    setForm({ to: "", subject: "", body: "" });
    setComposeOpen(false);
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            Internal Mail
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
            Leave workflow messages and internal mail
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddRounded />}
          onClick={() => setComposeOpen(true)}
          sx={{ borderRadius: "4px" }}
        >
          Compose
        </Button>
      </Stack>
      {notice ? (
        <Alert
          severity="info"
          onClose={() => setNotice("")}
          sx={{ m: 1.5, borderRadius: "4px" }}
        >
          {notice}
        </Alert>
      ) : null}
      <Grid container sx={{ minHeight: 540 }}>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            borderRight: { md: "1px solid" },
            borderColor: "divider",
            bgcolor: themeColors.hover,
          }}
        >
          {allMails.length ? (
            allMails.map((mail) => (
              <Box
                key={mail.id}
                onClick={() => setSelected(mail)}
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor:
                    selected?.id === mail.id
                      ? themeColors.overlay21
                      : "transparent",
                }}
              >
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }} noWrap>
                    {mail.sender}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                    {mail.date
                      ? new Date(mail.date).toLocaleDateString("en-IN")
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{ fontSize: 12.5, fontWeight: 600, mt: 0.4 }}
                  noWrap
                >
                  {mail.subject}
                </Typography>
                <Stack
                  direction="row"
                  gap={0.5}
                  alignItems="center"
                  sx={{ mt: 0.6 }}
                >
                  <MarkEmailUnreadRounded
                    sx={{ fontSize: 15, color: "primary.main" }}
                  />
                  <Typography
                    sx={{ fontSize: 11, color: "text.secondary" }}
                    noWrap
                  >
                    {mail.body}
                  </Typography>
                </Stack>
              </Box>
            ))
          ) : (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <EmailRounded sx={{ fontSize: 36, color: "text.disabled" }} />
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 1 }}>
                No messages yet
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={8}>
          {selected ? (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontSize: 19, fontWeight: 700 }}>
                    {selected.subject}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}
                  >
                    {formatDate(selected.date)}
                  </Typography>
                </Box>
                {selected.status ? (
                  <Chip
                    label={selected.status}
                    size="small"
                    sx={{ borderRadius: "4px", textTransform: "capitalize" }}
                  />
                ) : null}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                From:{" "}
                <Box component="span" color="text.primary" fontWeight={600}>
                  {selected.sender}
                </Box>
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}
              >
                To:{" "}
                <Box component="span" color="text.primary" fontWeight={600}>
                  {selected.recipient || user?.email}
                </Box>
              </Typography>
              <Paper
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: "4px",
                  border: "1px solid " + themeColors.border,
                  boxShadow: "none",
                  bgcolor: themeColors.hover,
                }}
              >
                <Typography sx={{ fontSize: 13, lineHeight: 1.7 }}>
                  {selected.body}
                </Typography>
              </Paper>
              {selected.kind === "leave" && canSeeAllLeaves ? (
                <Button
                  variant="outlined"
                  sx={{ mt: 2, borderRadius: "4px" }}
                  onClick={() => navigate("/dashboard/leave")}
                >
                  Open Leave Approval
                </Button>
              ) : null}
            </Box>
          ) : (
            <Box
              sx={{
                minHeight: 540,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                p: 3,
              }}
            >
              <Box>
                <EmailRounded sx={{ fontSize: 48, color: "primary.light" }} />
                <Typography sx={{ mt: 1, fontWeight: 700 }}>
                  Select a message
                </Typography>
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}
                >
                  Leave workflow messages and internal mail appear here.
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "4px" } }}
      >
        <DialogTitle sx={{ fontSize: 17, fontWeight: 700 }}>
          New message
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <TextField
              size="small"
              label="To"
              value={form.to}
              onChange={(e) =>
                setForm((current) => ({ ...current, to: e.target.value }))
              }
            />
            <TextField
              size="small"
              label="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((current) => ({ ...current, subject: e.target.value }))
              }
            />
            <TextField
              size="small"
              multiline
              minRows={6}
              label="Message"
              value={form.body}
              onChange={(e) =>
                setForm((current) => ({ ...current, body: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setComposeOpen(false)}
            sx={{ borderRadius: "4px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendRounded />}
            onClick={sendMail}
            sx={{ borderRadius: "4px" }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationHub;
