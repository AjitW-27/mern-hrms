import React from "react";
import { Menu, MenuItem } from "@mui/material";

const ExportMenu = ({ anchorEl, open, onClose, onExport }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    <MenuItem onClick={() => onExport("xlsx")}>Excel (.xlsx) — Recommended</MenuItem>
    <MenuItem onClick={() => onExport("csv")}>CSV (.csv) — Raw data</MenuItem>
    <MenuItem onClick={() => onExport("pdf")}>PDF (.pdf) — Print ready</MenuItem>
  </Menu>
);
export default ExportMenu;
