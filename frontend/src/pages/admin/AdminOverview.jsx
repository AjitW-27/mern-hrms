import { Badge as Chip } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useEffect, useMemo, useState } from "react";
import { Box, InputAdornment, OutlinedInput, Stack, Typography } from "@mui/material";
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
    "primary",
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
    "primary",
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
  indigo: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.infoSoft + ")",
  violet: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.infoSoft + ")",
  green: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.successSoft + ")",
  primary: "linear-gradient(135deg," + themeColors.primarySoft + "," + themeColors.primarySoft + ")",
  amber: "linear-gradient(135deg," + themeColors.overlay15 + "," + themeColors.warningSoft + ")",
};
const iconTone = {
  indigo: themeColors.info,
  violet: themeColors.purple,
  green: themeColors.success,
  primary: themeColors.primary,
  amber: themeColors.warning,
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
            <SearchRoundedIcon sx={{ fontSize: 20, color: themeColors.textMuted }} />
          </InputAdornment>
        }
        sx={{ height: 40, borderRadius: "4px", mb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: "auto" }}>
        {GROUPS.map((item) => (
          <Chip
            key={item}
            label={item}
            onClick={() => setGroup(item)}
            sx={{
              height: 32,
              bgcolor: group === item ? themeColors.primarySoft : themeColors.cardBg,
              color: group === item ? themeColors.secondaryDark : themeColors.textMuted,
              border: "1px solid",
              borderColor: group === item ? themeColors.textLight : themeColors.border,
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
      {recent.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: themeColors.textPrimary, mb: 1.25 }}
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
                  border: "1px solid " + themeColors.border,
                  bgcolor: themeColors.cardBg,
                  borderRadius: "4px",
                  p: 1.25,
                  minWidth: 180,
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow:
                    "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: themeColors.navyDark }}
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
                border: "1px solid " + themeColors.border,
                borderRadius: "4px",
                textAlign: "left",
                cursor: "pointer",
                background: GRADIENTS[item[5]],
                boxShadow:
                  "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
                transition: "180ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: themeColors.textLight,
                  boxShadow:
                    "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2 + ", 0 4px 24px -6px " + themeColors.overlay4,
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "4px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: themeColors.cardBg,
                    color: iconTone[item[5]],
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, color: themeColors.textPrimary }}
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
                  color: themeColors.textMuted,
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
