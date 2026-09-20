import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Stack,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  ChatBubbleRounded,
  SearchRounded,
  DoneAllRounded,
  MarkChatUnreadRounded,
  ForumRounded,
} from "@mui/icons-material";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import execReq, { SOCKET_BASE_URL } from "../../lib/execReq";
import useAuthStore from "../../strore/authStore";

const SOCKET_URL = SOCKET_BASE_URL;

const getId = (value) => String(value?._id || value?.id || value || "");
const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export default function MessageNotificationDropdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const token =
    useAuthStore((state) => state.token) ||
    localStorage.getItem("hrms_token") ||
    sessionStorage.getItem("token");
  const user = useAuthStore((state) => state.user);
  const userId = getId(user);
  const [anchorEl, setAnchorEl] = useState(null);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const socketRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const response = await execReq("/communication/unread-summary");
      const data = response?.data?.data || {};
      setUnreadCount(Number(data.unreadCount) || 0);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      // Messaging may be disabled by RBAC; keep the appbar quiet.
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread, location.pathname]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    socket.on("communication:message", (incoming) => {
      if (getId(incoming?.sender) === userId) return;
      const messageId = getId(incoming);
      if (messageId) {
        if (seenMessageIdsRef.current.has(messageId)) return;
        seenMessageIdsRef.current.add(messageId);
        if (seenMessageIdsRef.current.size > 200) {
          const first = seenMessageIdsRef.current.values().next().value;
          if (first) seenMessageIdsRef.current.delete(first);
        }
      }
      const conversationId = getId(incoming?.conversation);
      if (!conversationId) {
        fetchUnread();
        return;
      }
      const sender = incoming?.sender || {};
      setUnreadCount((count) => count + 1);
      setItems((current) => {
        const next = current.filter(
          (item) => item.conversationId !== conversationId,
        );
        next.unshift({
          conversationId,
          title: incoming?.conversation?.title || "",
          type: incoming?.conversation?.type || "direct",
          sender,
          text: incoming?.text || "New message",
          createdAt: incoming?.createdAt || new Date().toISOString(),
          unreadCount:
            (current.find((item) => item.conversationId === conversationId)
              ?.unreadCount || 0) + 1,
        });
        return next.slice(0, 8);
      });
    });
    socket.on("connect_error", () => {});
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, userId, fetchUnread]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.sender?.name, item.sender?.email, item.text, item.title].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
      ),
    );
  }, [items, search]);

  const openConversation = (conversationId) => {
    setAnchorEl(null);
    navigate(
      `/dashboard/communication?conversation=${encodeURIComponent(conversationId)}`,
    );
  };

  return (
    <>
      <TooltiplessIconButton
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          fetchUnread();
        }}
        aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ""}`}
      >
        <Badge
          badgeContent={unreadCount > 99 ? "99+" : unreadCount}
          color="error"
          invisible={!unreadCount}
          max={99}
        >
          <ChatBubbleRounded sx={{ fontSize: 20 }} />
        </Badge>
      </TooltiplessIconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: { xs: "calc(100vw - 24px)", sm: 390 },
            maxWidth: 390,
            borderRadius: "4px",
            border: "1px solid #C2EBEE",
            boxShadow:
              "0 24px 44px -12px rgba(15,23,42,.22), 0 4px 16px -4px rgba(15,23,42,.08)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            p: 1.75,
            background: "linear-gradient(135deg,#F0FBFC,#D5F1F4)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Box>
              <Typography
                sx={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}
              >
                Messages
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#64748B", mt: 0.3 }}>
                Direct messages and team conversations
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => {
                setAnchorEl(null);
                navigate("/dashboard/communication");
              }}
              startIcon={<ForumRounded sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: "4px",
              }}
            >
              Open chat
            </Button>
          </Stack>
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search unread messages"
            sx={{
              mt: 1.3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                bgcolor: "#FFFFFF",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "none", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider />
        <Box
          sx={{
            px: 1.5,
            py: 0.9,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.7}>
            <MarkChatUnreadRounded sx={{ fontSize: 16, color: "#0E8F9A" }} />
            <Typography
              sx={{ fontSize: 11, fontWeight: 800, color: "#475569" }}
            >
              {unreadCount ? `${unreadCount} unread` : "All caught up"}
            </Typography>
          </Stack>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllRounded sx={{ fontSize: 15 }} />}
              onClick={() => navigate("/dashboard/communication")}
              sx={{ textTransform: "none", fontSize: 11 }}
            >
              View all
            </Button>
          )}
        </Box>
        <List
          disablePadding
          sx={{ maxHeight: 420, overflowY: "auto", bgcolor: "#FFFFFF" }}
        >
          {filtered.length ? (
            filtered.map((item) => (
              <ListItemButton
                key={item.conversationId}
                onClick={() => openConversation(item.conversationId)}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  alignItems: "flex-start",
                  gap: 1.1,
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <Avatar
                  src={item.sender?.avatar || undefined}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "#0E8F9A",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {String(item.sender?.name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <Box minWidth={0} flex={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography
                      sx={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A" }}
                      noWrap
                    >
                      {item.sender?.name || item.title || "Conversation"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 10, color: "none", flexShrink: 0 }}
                    >
                      {formatTime(item.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      color: "#64748B",
                      mt: 0.35,
                      lineHeight: 1.45,
                    }}
                    noWrap
                  >
                    {item.text}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    minWidth: 18,
                    height: 18,
                    px: 0.4,
                    borderRadius: "9px",
                    bgcolor: "#E6F7F8",
                    color: "#0A5C67",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Box>
              </ListItemButton>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <ChatBubbleRounded sx={{ fontSize: 34, color: "#8DD8DE" }} />
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, mt: 1, color: "#334155" }}
              >
                No unread messages
              </Typography>
              <Typography sx={{ fontSize: 11, color: "none", mt: 0.4 }}>
                New messages will appear here instantly.
              </Typography>
            </Box>
          )}
        </List>
      </Popover>
    </>
  );
}

function TooltiplessIconButton({ children, ...props }) {
  return (
    <IconButton
      {...props}
      sx={{
        color: "#64748B",
        borderRadius: "4px",
        p: 0.75,
        "&:hover": { bgcolor: "rgba(14,143,154,.07)", color: "#0E8F9A" },
        ...(props.sx || {}),
      }}
    >
      {children}
    </IconButton>
  );
}
