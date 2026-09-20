import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

const MODULES = [
  [
    "Users",
    "People & Access",
    "Create, edit, activate and organize HRMS user accounts.",
    PeopleOutlineIcon,
    "/dashboard/admin/users",
    "indigo",
  ],
  [
    "Roles",
    "People & Access",
    "Maintain role names, codes, descriptions and status.",
    AdminPanelSettingsOutlinedIcon,
    "/dashboard/admin/roles",
    "violet",
  ],
  [
    "Access",
    "People & Access",
    "Manage create, read, update, approve and export access.",
    SecurityOutlinedIcon,
    "/dashboard/admin/rbac",
    "green",
  ],
  [
    "Departments",
    "Organization",
    "Maintain department masters and reporting structure.",
    ApartmentOutlinedIcon,
    "/dashboard/admin/departments",
    "teal",
  ],
  [
    "Organization",
    "Organization",
    "Manage company identity, contact details and timezone.",
    BusinessOutlinedIcon,
    "/dashboard/admin/organization",
    "amber",
  ],
  [
    "Locations",
    "Organization",
    "Maintain branches and operating locations.",
    LocationOnOutlinedIcon,
    "/dashboard/admin/locations",
    "green",
  ],
  [
    "Announcements",
    "Communication",
    "Publish time-bound company updates and notices.",
    CampaignOutlinedIcon,
    "/dashboard/admin/announcements",
    "indigo",
  ],
  [
    "Holidays",
    "Communication",
    "Maintain public and optional company holidays.",
    EventOutlinedIcon,
    "/dashboard/admin/holidays",
    "teal",
  ],
  [
    "Settings",
    "Platform",
    "Configure HRMS operational settings and preferences.",
    SettingsOutlinedIcon,
    "/dashboard/admin/settings",
    "violet",
  ],
  [
    "Audit & Activity",
    "Platform",
    "Review recorded administrative activity and audit information.",
    FactCheckOutlinedIcon,
    "/dashboard/audit-logs",
    "indigo",
  ],
];
const GROUPS = [
  "All",
  "People & Access",
  "Organization",
  "Communication",
  "Platform",
];
const GRADIENTS = {
  indigo: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",
  violet: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",
  green: "linear-gradient(135deg,#F0FDF7,#D1F5E4)",
  teal: "linear-gradient(135deg,#F0FBFC,#D5F1F4)",
  amber: "linear-gradient(135deg,rgba(255,255,255,.75)B,#FDEBC0)",
};
const iconTone = {
  indigo: "#4F46E5",
  violet: "#8B5CF6",
  green: "#10B981",
  teal: "#0E8F9A",
  amber: "#F59E0B",
};

const AdminOverview = () => {
  const navigate = useNavigate();
  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem("hrms_admin_recent") || "[]"));
    } catch {}
  }, []);
  const open = (item) => {
    const [name, category, , Icon, path] = item;
    const next = [
      { name, category, path, time: Date.now() },
      ...recent.filter((x) => x.path !== path),
    ].slice(0, 4);
    setRecent(next);
    localStorage.setItem("hrms_admin_recent", JSON.stringify(next));
    navigate(path);
  };
  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return MODULES.filter(
      ([name, category, description]) =>
        (group === "All" || category === group) &&
        (!q || `${name} ${category} ${description}`.toLowerCase().includes(q)),
    );
  }, [group, query]);
  return (
    <Box>
      <PageHeader title="Administration" />
      <OutlinedInput
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search administration"
        startAdornment={
          <InputAdornment position="start">
            <SearchRoundedIcon sx={{ fontSize: 20, color: "#64748B" }} />
          </InputAdornment>
        }
        sx={{ height: 40, borderRadius: 8, mb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: "auto" }}>
        {GROUPS.map((item) => (
          <Chip
            key={item}
            label={item}
            onClick={() => setGroup(item)}
            sx={{
              height: 32,
              bgcolor: group === item ? "#E6F7F8" : "#FFFFFF",
              color: group === item ? "#0A5C67" : "#475569",
              border: "1px solid",
              borderColor: group === item ? "#8DD8DE" : "#E2E8F0",
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
      {recent.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B", mb: 1.25 }}
          >
            Recently visited
          </Typography>
          <Stack direction="row" spacing={1.25} sx={{ overflowX: "auto" }}>
            {recent.map((item) => (
              <Box
                key={item.path}
                component="button"
                onClick={() => navigate(item.path)}
                sx={{
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  borderRadius: 1,
                  p: 1.25,
                  minWidth: 180,
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow:
                    "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}
                >
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "none", mt: 0.25 }}>
                  {item.category} ·{" "}
                  {new Date(item.time).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,1fr)",
            lg: "repeat(3,1fr)",
          },
          gap: 2,
        }}
      >
        {visible.map((item) => {
          const Icon = item[3];
          return (
            <Box
              key={item[4]}
              component="button"
              onClick={() => open(item)}
              sx={{
                minHeight: 182,
                p: 2,
                border: "1px solid #E2E8F0",
                borderRadius: 1,
                textAlign: "left",
                cursor: "pointer",
                background: GRADIENTS[item[5]],
                boxShadow:
                  "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
                transition: "180ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "#8DD8DE",
                  boxShadow:
                    "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05), 0 4px 24px -6px rgba(14,143,154,.35)",
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#FFFFFF",
                    color: iconTone[item[5]],
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}
                  >
                    {item[0]}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: iconTone[item[5]],
                    }}
                  >
                    {item[1]}
                  </Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  lineHeight: "20px",
                  color: "#475569",
                  mt: 2,
                }}
              >
                {item[2]}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: iconTone[item[5]],
                  mt: 2,
                  textTransform: "uppercase",
                }}
              >
                Manage →
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
export default AdminOverview;
