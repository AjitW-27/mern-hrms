import React from "react";
import { Link } from "react-router-dom";
import { branding } from "../../config/branding";
import { colors } from "../../theme/designTokens";
export default function Logo({ open = true }) { return <Link to="/dashboard" aria-label={branding.appName + " dashboard"} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", whiteSpace: "nowrap", color: colors.textPrimary }}><img src={branding.logoUrl} alt="" width="40" height="40" style={{ borderRadius: "4px", display: "block", flexShrink: 0 }} />{open && <span style={{ fontSize: 19, fontWeight: 700 }}>{branding.appName}</span>}</Link>; }
