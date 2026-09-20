import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PageHeader from "../../components/common/PageHeader";
import EmployeeCard from "../../components/common/EmployeeCard";
import execReq from "../../lib/execReq";
import { useNavigate } from "react-router-dom";
import { makeXlsx, downloadBlob } from "../../lib/exportUtils";

const Employees = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("asc");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await execReq("/employees");
      setRows(data?.data || data?.employees || []);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const departments = [
    ...new Set(
      rows.map((r) => r.department?.name || r.department).filter(Boolean),
    ),
  ];
  const roles = [
    ...new Set(
      rows.map((r) => r.designation || r.role?.name || r.role).filter(Boolean),
    ),
  ];
  const filtered = rows
    .filter((r) => {
      const name =
        `${r.fullName || ""} ${r.employeeId || ""} ${r.designation || ""} ${r.department?.name || r.department || ""}`.toLowerCase();
      return (
        (!query || name.includes(query.toLowerCase())) &&
        (!department ||
          String(r.department?.name || r.department) === department) &&
        (!role || String(r.designation || r.role?.name || r.role) === role)
      );
    })
    .sort((a, b) => {
      const n = (x) => String(x.fullName || x.name || "");
      return sort === "asc"
        ? n(a).localeCompare(n(b))
        : n(b).localeCompare(n(a));
    });
  const reset = () => {
    setQuery("");
    setDepartment("");
    setRole("");
    setSort("asc");
  };
  const exportCsv = () => {
    const rows = filtered.map((r) => [
      r.fullName || r.name || "",
      r.designation || r.role?.name || r.role || "",
      r.department?.name || r.department || "",
      r.employeeId || "",
    ]);
    const blob = new Blob(
      [["Name", "Role", "Department", "Employee ID"], ...rows]
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n"),
      { type: "text/csv;charset=utf-8" },
    );
    downloadBlob(
      blob,
      `employees_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };
  const exportXlsx = () => {
    const rows = filtered.map((r) => [
      r.fullName || r.name || "",
      r.designation || r.role?.name || r.role || "",
      r.department?.name || r.department || "",
      r.employeeId || "",
    ]);
    downloadBlob(
      makeXlsx(["Name", "Role", "Department", "Employee ID"], rows),
      `employees_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };
  return (
    <Box>
      <PageHeader
        title="Employees"
        actionLabel="Add Employee"
        onAction={() => navigate("/dashboard/add-employee")}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          p: "12px 16px",
          mb: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 1,
          boxShadow:
            "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={1}
          alignItems="center"
        >
          <TextField
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees..."
            InputProps={{
              startAdornment: (
                <SearchRoundedIcon
                  sx={{ mr: 1, color: "#64748B", fontSize: 20 }}
                />
              ),
            }}
            sx={{ width: { xs: "100%", md: 340 } }}
          />
          <Stack direction="row" spacing={1}>
            <Tooltip title="Sort">
              <IconButton
                onClick={() => setSort((v) => (v === "asc" ? "desc" : "asc"))}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  bgcolor: sort !== "asc" ? "#E6F7F8" : "#FFFFFF",
                }}
              >
                <SortRoundedIcon
                  sx={{
                    transform: sort === "desc" ? "rotate(180deg)" : "none",
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset">
              <IconButton
                onClick={reset}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                }}
              >
                <FilterAltOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton
                onClick={(e) => setExportAnchor(e.currentTarget)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  color: "#FFFFFF",
                  background: "linear-gradient(135deg,#0E8F9A,#0B7480)",
                }}
              >
                {loading ? (
                  <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                ) : (
                  <DownloadOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setDepartment("");
            setFilterAnchor(null);
          }}
        >
          All departments
        </MenuItem>
        {departments.map((d) => (
          <MenuItem
            key={d}
            onClick={() => {
              setDepartment(d);
              setFilterAnchor(null);
            }}
          >
            {d}
          </MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem
          onClick={() => {
            setRole("");
            setFilterAnchor(null);
          }}
        >
          All roles
        </MenuItem>
        {roles.map((r) => (
          <MenuItem
            key={r}
            onClick={() => {
              setRole(r);
              setFilterAnchor(null);
            }}
          >
            {r}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            exportXlsx();
            setExportAnchor(null);
          }}
        >
          Excel (.xlsx) — Recommended
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportCsv();
            setExportAnchor(null);
          }}
        >
          CSV (.csv) — Raw data
        </MenuItem>
      </Menu>
      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2,1fr)",
              lg: "repeat(3,1fr)",
              xl: "repeat(4,1fr)",
            },
            gap: 2,
          }}
        >
          {filtered.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onClick={() => navigate(`/dashboard/employee/${employee._id}`)}
            />
          ))}
        </Box>
      )}
      {!loading && !filtered.length && (
        <Box sx={{ py: 10, textAlign: "center", color: "none" }}>
          No employees found.
        </Box>
      )}
    </Box>
  );
};
export default Employees;
