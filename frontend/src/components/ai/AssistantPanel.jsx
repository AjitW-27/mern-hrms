import { Button, Badge as Chip, IconButton, Input as TextField } from "../common/UI";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, CircularProgress, Divider, Drawer, Fab, Stack, Tooltip, Typography } from "@mui/material";
import { AutoAwesomeOutlined, Close, ContentCopyOutlined, Refresh, SendOutlined } from "@mui/icons-material";
import useAuthStore from "../../strore/authStore";
import execReq from "../../lib/execReq";
import { colors, shadows } from "../../theme/designTokens";

export default function AssistantPanel() {
  const user = useAuthStore(state => state.user);
  const [open, setOpen] = useState(false), [status, setStatus] = useState(null), [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState(""), [sending, setSending] = useState(false), [error, setError] = useState(""), [retry, setRetry] = useState("");
  const [copied, setCopied] = useState(null);
  const [launcherBottom, setLauncherBottom] = useState(24);
  useEffect(() => {
    if (open) return;
    const measure = () => { let bottom = 24; for (const footer of document.querySelectorAll('[data-ui="table-footer"]')) { const rect = footer.getBoundingClientRect(); if (rect.bottom > innerHeight - 110 && rect.top < innerHeight - 12) bottom = Math.max(bottom, innerHeight - rect.top + 16); } setLauncherBottom(bottom); };
    const observer = new MutationObserver(measure); observer.observe(document.body, { childList: true, subtree: true }); window.addEventListener("resize", measure); document.addEventListener("scroll", measure, true); measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); document.removeEventListener("scroll", measure, true); };
  }, [open]);
  const endRef = useRef(null);
  const checkStatus = useCallback(async () => {
    setStatus(null);
    try { const { data } = await execReq("/ai-assistant/status"); setStatus(data.data); }
    catch (err) { setStatus({ enabled: false, message: err?.response?.data?.message || "The assistant could not be reached. Please retry.", code: "STATUS_UNREACHABLE" }); }
  }, []);
  useEffect(() => { if (open) checkStatus(); }, [open, checkStatus]);
  useEffect(() => { const show = () => setOpen(true); window.addEventListener("hrms:open-assistant", show); return () => window.removeEventListener("hrms:open-assistant", show); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);
  const send = async (value = draft) => {
    const message = value.trim();
    if (!message || sending || !status?.enabled) return;
    setError(""); setDraft(""); setSending(true); setRetry(message);
    const history = messages.slice(-10);
    setMessages([...history, { role: "user", content: message }]);
    try {
      const { data } = await execReq.post("/ai-assistant/chat", { message, history }, { timeout: 60000 });
      if (!data.success) throw new Error("The assistant could not answer this request.");
      setMessages(current => [...current, { role: "assistant", content: data.data.message }].slice(-10));
      setRetry("");
    } catch (err) { setMessages(history); setError(err?.response?.data?.message || err.message || "Request failed. Please retry."); }
    finally { setSending(false); }
  };
  const reset = () => { if (sending) return; setMessages([]); setDraft(""); setError(""); setRetry(""); };
  const copy = async (content, index) => {
    try { await navigator.clipboard.writeText(content); setCopied(index); }
    catch { setError("Copy is unavailable in this browser. You can select and copy the reply text."); }
  };
  return <>
    {!open && <Tooltip title="AI HR Assistant"><Fab color="primary" aria-label="Open AI HR Assistant" onClick={() => setOpen(true)} sx={{ position: "fixed", bottom: launcherBottom, right: 24, borderRadius: "4px", zIndex: 1200, boxShadow: shadows.popup }}><AutoAwesomeOutlined /></Fab></Tooltip>}
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} sx={{ zIndex: 1500 }} PaperProps={{ sx: { width: { xs: "100%", sm: 400 }, maxWidth: "100%", borderRadius: "4px", bgcolor: colors.cardBg, border: "1px solid " + colors.border } }}>
      <Stack sx={{ height: "100%", minHeight: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
          <AutoAwesomeOutlined sx={{ color: colors.primary }} /><Box sx={{ flex: 1 }}><Typography fontWeight={600} color={colors.textPrimary}>AI HR Assistant</Typography><Typography variant="caption">{status ? status.mode === "local" ? "Local HRMS assistant" : status.enabled ? "Ready to help" : "Unavailable" : "Connecting…"}</Typography></Box>
          <Tooltip title="New chat"><IconButton aria-label="New chat" disabled={sending} onClick={reset}><Refresh fontSize="small" /></IconButton></Tooltip><IconButton aria-label="Close assistant" onClick={() => setOpen(false)}><Close fontSize="small" /></IconButton>
        </Stack><Divider />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
          {status && <Alert severity={status.enabled ? "info" : "warning"} sx={{ mb: 2 }} action={!status.enabled ? <Button size="small" onClick={checkStatus}>Retry</Button> : null}>{status.message}</Alert>}
          {!messages.length && <Box sx={{ mb: 3 }}><Typography fontWeight={600}>Hello, {user?.name || "there"}</Typography><Typography variant="body2" sx={{ mt: 0.5, mb: 2 }}>Ask about the HRMS records you have permission to view.</Typography><Stack spacing={1}>{["Show my leave balance", "Who is on leave today?", "Upcoming holidays", "Attendance this month"].map(question => <Chip key={question} component="button" type="button" variant="outlined" label={question} disabled={!status?.enabled || sending} onClick={() => send(question)} sx={{ borderRadius: "4px", justifyContent: "flex-start", height: 36, cursor: "pointer", borderColor: colors.border }} />)}</Stack></Box>}
          <Stack spacing={1.5}>{messages.map((message, index) => <Box key={index} sx={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "92%", bgcolor: message.role === "user" ? colors.primary : colors.cardBg, color: message.role === "user" ? colors.cardBg : colors.textPrimary, border: "1px solid " + (message.role === "user" ? colors.primary : colors.border), borderRadius: "4px", px: 1.5, py: 1.25 }}>
            <Typography variant="body2" sx={{ color: "inherit", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{message.content}</Typography>
            {message.role === "assistant" && <Button size="small" startIcon={<ContentCopyOutlined sx={{ fontSize: 14 }} />} onClick={() => copy(message.content, index)} sx={{ mt: 0.5, minHeight: 26 }}>{copied === index ? "Copied" : "Copy"}</Button>}
          </Box>)}</Stack>
          {sending && <Stack direction="row" alignItems="center" spacing={1} role="status" sx={{ mt: 2 }}><CircularProgress size={14} /><Typography variant="caption">Checking your HRMS records…</Typography></Stack>}
          {error && <Alert severity="error" sx={{ mt: 2 }} action={retry && <Button size="small" disabled={sending} onClick={() => send(retry)}>Retry</Button>}>{error}</Alert>}<div ref={endRef} />
        </Box>
        <Box component="form" onSubmit={event => { event.preventDefault(); send(); }} sx={{ p: 2, borderTop: "1px solid " + colors.border, flexShrink: 0 }}>
          <TextField fullWidth multiline minRows={2} maxRows={5} value={draft} disabled={sending || !status?.enabled} placeholder="Ask about your HRMS…" inputProps={{ maxLength: 2000, "aria-label": "Message the HR assistant" }} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1 }}><Typography variant="caption">Enter to send · Shift+Enter for a new line</Typography><Button type="submit" variant="contained" disabled={!draft.trim() || sending || !status?.enabled} endIcon={<SendOutlined fontSize="small" />}>Send</Button></Stack>
        </Box>
      </Stack>
    </Drawer>
  </>;
}
