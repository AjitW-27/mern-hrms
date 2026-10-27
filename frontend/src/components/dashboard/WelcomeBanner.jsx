import React from "react";
import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Card } from "../common/UI";
export function WelcomeBanner({ userName, avatar, pendingApprovals, leaveRequests, onAddSchedule, onAddRequest }) {
 const navigate = useNavigate();
 return <Card sx={{ p: 2 }}><Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap"><Avatar name={userName} src={avatar} /><Stack sx={{ flex: 1 }}><Typography component="h2" fontWeight={600}>Welcome Back{userName ? ", " + userName : ""}</Typography>{pendingApprovals !== undefined && <Typography variant="body2">{pendingApprovals} Pending Approvals</Typography>}{leaveRequests !== undefined && <Typography variant="body2">{leaveRequests} Leave Requests</Typography>}</Stack><Button variant="primary" onClick={onAddSchedule || (() => navigate("/dashboard/communication", { state: { tab: "meetings" } }))}>Add Schedule</Button><Button variant="primary" onClick={onAddRequest || (() => navigate("/dashboard/leave"))}>Add Requests</Button></Stack></Card>;
}
export default WelcomeBanner;
