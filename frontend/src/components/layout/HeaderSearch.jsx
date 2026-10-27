import { Card as Paper, Input as TextField } from "../common/UI";
import React, { useEffect, useRef, useState } from "react";
import { Box, InputAdornment, MenuItem, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../strore/authStore";
import { colors } from "../../theme/designTokens";
const routes = [["Dashboard", "/dashboard", "dashboard"], ["Employees", "/dashboard/employees", "employees"], ["Departments", "/dashboard/departments", "departments"], ["Projects", "/dashboard/projects", "projects"], ["Attendance", "/dashboard/attendance", "attendance"], ["Leave", "/dashboard/leave", "leave"], ["Payroll", "/dashboard/payroll", "payroll"], ["Reports", "/dashboard/reports", "reports"], ["Settings", "/dashboard/settings", "settings"]];
export default function HeaderSearch() {
  const input = useRef(null), navigate = useNavigate(), [query, setQuery] = useState(""), [focused, setFocused] = useState(false);
  const user = useAuthStore(state => state.user);
  const matches = routes.filter(([name, , module]) => name.toLowerCase().includes(query.toLowerCase()) && (!user?.rolePermissions || user.rolePermissions[module]?.read));
  useEffect(() => { const shortcut = event => { if ((event.ctrlKey || event.metaKey) && event.key === "/") { event.preventDefault(); input.current?.focus(); } }; window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut); }, []);
  return <Box sx={{ position: "relative", width: { xs: "100%", md: 290 }, minWidth: 0 }}><TextField fullWidth inputRef={input} size="small" placeholder="Search in HRMS" value={query} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setFocused(false); if (event.key === "Enter" && matches[0]) { navigate(matches[0][1]); setQuery(""); setFocused(false); input.current.blur(); } }} inputProps={{ "aria-label": "Search HRMS navigation" }} InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>, endAdornment: <Typography variant="caption" sx={{ whiteSpace: "nowrap", display: { xs: "none", lg: "block" } }}>CTRL + /</Typography> }} sx={{ "& fieldset": { borderColor: colors.border } }} />{focused && <Paper sx={{ position: "absolute", top: "100%", left: 0, right: 0, mt: 1, zIndex: 1600, border: "1px solid " + colors.border }}>{matches.length ? matches.map(([name, path]) => <MenuItem key={path} onMouseDown={event => event.preventDefault()} onClick={() => { navigate(path); setQuery(""); setFocused(false); }}>{name}</MenuItem>) : <Typography variant="body2" sx={{ p: 2 }}>No matching modules.</Typography>}</Paper>}</Box>;
}
