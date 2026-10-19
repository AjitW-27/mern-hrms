import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import execReq from "../lib/execReq";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("hrms_token") || sessionStorage.getItem("hrms_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await execReq("/auth/profile");
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("hrms_user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        setUser(null);
      }
    }
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await execReq.post("/auth/login", { email, password });
    const payload = data?.data || data || {};
    const token = payload.accessToken || payload.token;
    if (!token || !payload.user) throw new Error("Login response is missing token or user details.");
    sessionStorage.setItem("hrms_token", token);
    sessionStorage.setItem("token", token);
    if (payload.refreshToken) sessionStorage.setItem("hrms_refresh_token", payload.refreshToken);
    localStorage.setItem("rememberMe", "false");
    localStorage.setItem("hrms_user", JSON.stringify(payload.user));
    setUser(payload.user);
    return payload.user;
  };

  const logout = () => {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, login, logout, refreshUser, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
