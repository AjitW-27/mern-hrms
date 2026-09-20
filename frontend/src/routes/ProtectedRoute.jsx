import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../strore/authStore";
import execReq from "../lib/execReq";

const routeModule = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  const segment = parts[1] || "dashboard";
  const child = parts[2] || "";

  if (segment === "enterprise") {
    if (child === "shifts" || child === "leave-policies") {
      return [child === "shifts" ? "attendance" : "leave", "read"];
    }
    if (child === "branches") return ["organizations", "read"];
  }

  if (segment === "admin") {
    return [
      {
        users: "users",
        roles: "roles",
        rbac: "roles",
        departments: "departments",
        organization: "organizations",
        locations: "organizations",
        settings: "settings",
      }[child] || "users",
      "read",
    ];
  }

  const map = {
    dashboard: ["dashboard", "read"],
    employees: ["employees", pathname.includes("add-employee") ? "create" : pathname.includes("edit-employee") ? "update" : "read"],
    employee: ["employees", "read"],
    "add-employee": ["employees", "create"],
    "edit-employee": ["employees", "update"],
    departments: ["departments", "read"],
    "add-department": ["departments", "create"],
    projects: ["projects", "read"],
    "add-project": ["projects", "create"],
    attendance: ["attendance", "read"],
    payroll: ["payroll", "read"],
    leave: ["leave", "read"],
    expenses: ["expenses", "read"],
    assets: ["assets", "read"],
    onboarding: ["onboarding", "read"],
    training: ["training", "read"],
    performance: ["performance", "read"],
    goals: ["goals", "read"],
    reports: ["reports", "read"],
    "audit-logs": ["audit", "read"],
    settings: ["settings", "read"],
  };

  return map[segment] || [segment, "read"];
};

const readCachedRbac = () => {
  try {
    return localStorage.getItem("hrms_rbac_enabled") === "true";
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, setUser } = useAuthStore();
  const location = useLocation();

  const storedToken =
    token ||
    localStorage.getItem("hrms_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const resolvedUser =
    user ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("hrms_user") || "null");
      } catch {
        return null;
      }
    })();

  const [rbacEnabled, setRbacEnabled] = useState(readCachedRbac);
  const [currentUser, setCurrentUser] = useState(resolvedUser);
  // Never block the application startup on the RBAC/profile network check.
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!storedToken) return undefined;

    let mounted = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1000);

    // Refresh auth/RBAC in the background. Cached auth data is used immediately,
    // while the server remains the final security authority.
    Promise.all([
      execReq("/settings", { signal: controller.signal }),
      execReq("/auth/profile", { signal: controller.signal }),
    ])
      .then(([settingsRes, profileRes]) => {
        if (!mounted) return;

        const enabled = settingsRes?.data?.data?.rbacEnabled === true;
        setRbacEnabled(enabled);
        localStorage.setItem("hrms_rbac_enabled", String(enabled));

        const fresh = profileRes?.data?.user;
        if (fresh) {
          setCurrentUser(fresh);
          if (setUser) setUser(fresh);
          else localStorage.setItem("hrms_user", JSON.stringify(fresh));
        }
      })
      .catch(() => {
        // Keep the cached state on slow/unavailable API; backend still enforces RBAC.
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [storedToken, setUser]);

  const permission = useMemo(() => {
    const [module, action] = routeModule(location.pathname);
    return { module, action };
  }, [location.pathname]);

  if (!storedToken) return <Navigate to="/" replace />;

  // Cached state lets localhost render immediately instead of waiting for API/DB.
  if (checking) return null;

  const activeUser = currentUser || resolvedUser;
  const role = String(activeUser?.role || "employee").toLowerCase();

  if (!rbacEnabled) return <Outlet />;
  if (["superadmin", "super_admin"].includes(role)) return <Outlet />;

  const permissions = activeUser?.rolePermissions || {};
  const allowed = Boolean(permissions?.[permission.module]?.[permission.action]);

  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
