import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../strore/authStore";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user } = useAuthStore();
  const storedToken =
    token ||
    localStorage.getItem("hrms_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!storedToken) return <Navigate to="/" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
