import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
const AdminLayout = () => <Box sx={{ width: "100%" }}><Outlet /></Box>;
export default AdminLayout;
