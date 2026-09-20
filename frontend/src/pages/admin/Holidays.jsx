import React from "react";
import ModulePage from "../../components/common/ModulePage";
const config = {
  title: "Holidays", endpoint: "/admin/holidays", actionLabel: "Add Holiday",
  columns: [{ field: "name", headerName: "Holiday" }, { field: "date", headerName: "Date", type: "date" }, { field: "type", headerName: "Type", filterOptions: ["Public", "Optional"] }, { field: "isActive", headerName: "Status", valueGetter: (row) => row.isActive ? "Active" : "Inactive", type: "status", filterOptions: ["Active", "Inactive"] }],
  filters: [{ field: "type", label: "Type", options: ["Public", "Optional"] }, { field: "isActive", label: "Status", options: ["Active", "Inactive"] }],
  fields: [{ name: "name", label: "Holiday Name", required: true, md: 6 }, { name: "date", label: "Date", required: true, type: "date", md: 6 }, { name: "type", label: "Type", options: ["Public", "Optional"], defaultValue: "Public", md: 6 }, { name: "isActive", label: "Status", options: [{ value: true, label: "Active" }, { value: false, label: "Inactive" }], defaultValue: true, md: 6 }, { name: "description", label: "Notes", multiline: true, rows: 3, md: 12 }],
};
export default function Holidays() { return <ModulePage config={config} breadcrumbs={["Administration", "Communication", "Holidays"]} />; }
