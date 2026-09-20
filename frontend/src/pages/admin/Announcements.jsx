import React from "react";
import ModulePage from "../../components/common/ModulePage";

const config = {
  title: "Announcements", endpoint: "/admin/announcements", actionLabel: "Add Announcement",
  columns: [
    { field: "title", headerName: "Title" }, { field: "priority", headerName: "Priority" },
    { field: "publishDate", headerName: "Published", type: "datetime-local" }, { field: "expiryDate", headerName: "Expires", type: "datetime-local" },
    { field: "isActive", headerName: "Status", valueGetter: (row) => row.isActive ? "Published" : "Unpublished", type: "status", filterOptions: ["Published", "Unpublished"] },
  ],
  filters: [{ field: "isActive", label: "Status", options: ["Published", "Unpublished"] }, { field: "priority", label: "Priority", options: ["Low", "Normal", "High"] }],
  fields: [
    { name: "title", label: "Title", required: true, md: 12 }, { name: "priority", label: "Priority", options: ["Low", "Normal", "High"], defaultValue: "Normal", md: 6 },
    { name: "audience", label: "Audience", options: ["All", "Department", "Role"], defaultValue: "All", md: 6 },
    { name: "message", label: "Content", required: true, multiline: true, rows: 5, md: 12 },
    { name: "publishDate", label: "Publish Date & Time", type: "datetime-local", md: 6 }, { name: "expiryDate", label: "Expiry Date & Time", type: "datetime-local", md: 6 },
    { name: "targetDepartment", label: "Target Department", md: 6 }, { name: "targetRole", label: "Target Role", md: 6 },
    { name: "isActive", label: "Status", options: [{ value: true, label: "Published" }, { value: false, label: "Unpublished" }], defaultValue: true, md: 6 },
  ],
};
export default function Announcements() { return <ModulePage config={config} breadcrumbs={["Administration", "Communication", "Announcements"]} />; }
