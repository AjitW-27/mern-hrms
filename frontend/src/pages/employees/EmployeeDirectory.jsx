import { Avatar, Badge, Button, ConfirmDialog, IconButton, Modal, Select } from "../../components/common/UI";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { Add, ChevronLeft, ChevronRight, DeleteOutline, DownloadOutlined, EditOutlined, FilterAltOutlined, GridViewOutlined, Search, TableRowsOutlined, UploadOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import execReq from "../../lib/execReq";
import DataTable from "../../components/common/DataTable";
import { fetchCollection } from "../../lib/collections";
import EmployeeCard from "../../components/common/EmployeeCard";
import { makeXlsx, downloadBlob } from "../../lib/exportUtils";
import useAuthStore from "../../strore/authStore";

const nameOf = value => typeof value === "object" ? value?.name || value?.fullName || "—" : value || "—";
const designationOf = row => String(row.designation || "—").replace(/team leade\b/i, "Team Lead");
export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const role = String(user?.role?.code || user?.role || "employee");
  const canWrite = action => user?.rolePermissions ? user.rolePermissions.employees?.[action] === true : ["admin", "hr", "superadmin", "super_admin"].includes(role);
  const [rows, setRows] = useState([]), [total, setTotal] = useState(0), [query, setQuery] = useState(""), [department, setDepartment] = useState(""), [sort, setSort] = useState("asc");
  const [page, setPage] = useState(0), [view, setView] = useState("list"), [loading, setLoading] = useState(true), [error, setError] = useState(""), [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState("all"), [pageSize, setPageSize] = useState(25);
  const [designation, setDesignation] = useState("");
  const [importOpen, setImportOpen] = useState(false), [importRows, setImportRows] = useState(null), [importResult, setImportResult] = useState(""), [busy, setBusy] = useState(false), [deleting, setDeleting] = useState(null);
  const fileRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await execReq("/employees", { params: { search: query, department, designation, page: page + 1, limit: pageSize, sort: "fullName", order: sort } });
      if (status === "all") { setRows(data.data || []); setTotal(data.total || 0); }
      else { const all = await fetchCollection("/employees", { search: query, department, designation, sort: "fullName", order: sort }); const selected = all.filter(row => status === "probation" ? /probation/i.test([row.employmentStatus, row.employmentType].join(" ")) : status === "inactive" ? row.isActive === false || /resigned|terminated|inactive/i.test(row.employmentStatus || "") : row.isActive !== false && !/resigned|terminated|inactive/i.test(row.employmentStatus || "")); setRows(selected); setTotal(selected.length); }
    } catch (err) { setError(err?.response?.data?.message || "Unable to load employees."); }
    finally { setLoading(false); }
  }, [query, department, designation, page, sort, status, pageSize]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { execReq("/departments").then(({ data }) => setDepartments(data.data || [])).catch(() => {}); }, []);
  const exportRows = async format => {
    try {
      setBusy(true); let all = [], next = 1, count = 1;
      while (all.length < count) {
        const { data } = await execReq("/employees", { params: { search: query, department, designation, page: next++, limit: 100, sort: "fullName", order: sort } });
        all.push(...(data.data || [])); count = data.total || all.length; if (!data.data?.length) break;
      }
      all = all.filter(row => status === "all" || (status === "probation" ? /probation/i.test([row.employmentStatus, row.employmentType].join(" ")) : status === "inactive" ? row.isActive === false || /resigned|terminated|inactive/i.test(row.employmentStatus || "") : row.isActive !== false && !/resigned|terminated|inactive/i.test(row.employmentStatus || "")));
      const headings = ["Employee Name", "Email", "Employee No", "Designation", "Team", "Reporting Manager", "Joining Date"];
      const values = all.map(row => [row.fullName, row.email, row.employeeId, designationOf(row), nameOf(row.department), nameOf(row.reportsTo), row.joiningDate ? new Date(row.joiningDate).toLocaleDateString("en-GB") : ""]);
      const blob = format === "xlsx" ? makeXlsx(headings, values) : new Blob([[headings, ...values].map(line => line.map(value => '"' + String(value || "").replaceAll('"', '""') + '"').join(",")).join("\n")], { type: "text/csv" });
      downloadBlob(blob, "employees." + format);
    } catch { setError("Could not export employees. Please retry."); }
    finally { setBusy(false); }
  };
  const readImport = async event => {
    try { const value = JSON.parse(await event.target.files[0].text()); const records = Array.isArray(value) ? value : value.employees; if (!Array.isArray(records) || !records.length) throw new Error(); setImportRows(records); setImportResult(records.length + " records ready for review and import."); }
    catch { setImportRows(null); setImportResult("Choose a valid JSON array of employee records or an object containing employees."); }
  };
  const importEmployees = async () => {
    setBusy(true);
    try { const { data } = await execReq.post("/employees/bulk-import", { employees: importRows }); setImportResult(data.message + (data.results?.failed?.length ? " " + data.results.failed.map(item => item.email + ": " + item.reason).join("; ") : "")); setImportRows(null); await load(); }
    catch (err) { setImportResult(err?.response?.data?.message || "Import failed. No successful import is assumed."); }
    finally { setBusy(false); }
  };
  const remove = async () => { setBusy(true); try { await execReq.delete("/employees/" + deleting._id); setDeleting(null); if (rows.length === 1 && page > 0) setPage(page - 1); else await load(); } catch (err) { throw new Error(err?.response?.data?.message || "Could not delete employee.", { cause: err }); } finally { setBusy(false); } };
  const columns = [
    { field: "fullName", headerName: "Employee Name", minWidth: 250, renderCell: row => <Stack direction="row" spacing={1.5} alignItems="center"><Avatar src={row.avatar} name={row.fullName} /><Box><Typography sx={{ fontWeight: 600, fontSize: 13 }}>{row.fullName}</Typography><Typography variant="caption">{row.email}</Typography></Box></Stack> },
    { field: "employeeId", headerName: "Employee No" },
    { field: "designation", headerName: "Designation", valueGetter: designationOf },
    { field: "department", headerName: "Team", renderCell: row => <Badge>{nameOf(row.team || row.department)}</Badge> },
    { field: "reportsTo", headerName: "Reporting Manager", valueGetter: row => nameOf(row.reportsTo) },
    { field: "joiningDate", headerName: "Joining Date", valueGetter: row => row.joiningDate ? new Date(row.joiningDate).toLocaleDateString("en-GB") : "" },
  ];
  return <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column" }}>
    <DataTable rows={rows} columns={columns} loading={loading} error={error} onRefresh={load} searchValue={query} onSearchChange={value => { setQuery(value); setPage(0); }} searchPlaceholder="Search employees" paginationMode={status === "all" ? "server" : "client"} page={page} rowsPerPage={pageSize} totalCount={total} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={event => { setPageSize(Number(event.target.value)); setPage(0); }}
      toolbarLeft={<><Select label="Status" value={status} options={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "probation", label: "Probation" }]} onChange={event => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 135, maxWidth: 150 }} /><Select label="Sort" value={sort} options={[{ value: "asc", label: "First name A-Z" }, { value: "desc", label: "First name Z-A" }]} onChange={event => { setSort(event.target.value); setPage(0); }} sx={{ minWidth: 160, maxWidth: 180 }} /></>}
      toolbarActions={<><Button variant="outline" disabled={busy} onClick={() => exportRows("xlsx")}>Excel</Button><Button variant="outline" disabled={busy} onClick={() => exportRows("csv")}>CSV</Button><IconButton aria-label="Employee grid view" onClick={() => setView(view === "grid" ? "list" : "grid")}><GridViewOutlined fontSize="small" /></IconButton>{canWrite("create") && <Button variant="outline" onClick={() => { setImportOpen(true); setImportResult(""); }}>Import Employees</Button>}</>}
      addBtn={canWrite("create") ? "Add Employee" : undefined} onAddClick={() => navigate("/dashboard/add-employee")} onView={row => navigate("/dashboard/employee/" + row._id)} onEdit={canWrite("update") ? row => navigate("/dashboard/edit-employee/" + row._id) : undefined} onDelete={canWrite("delete") ? setDeleting : undefined}
      renderGrid={view === "grid" ? displayed => <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 2 }}>{displayed.map(employee => <EmployeeCard key={employee._id} employee={employee} onClick={() => navigate("/dashboard/employee/" + employee._id)} />)}</Box> : undefined}
      onFilterChange={values => { setDepartment(values.department || ""); setDesignation(values.designation || ""); setPage(0); }} filterFields={[{ field: "department", label: "Department", options: departments.map(item => ({ value: item._id, label: item.name })) }, { field: "designation", label: "Designation" }]} emptyMessage={status === "inactive" ? "No inactive employee records are available from the employee directory API." : "No employees match these filters."} />
    <Modal open={importOpen} onClose={() => { if (!busy) setImportOpen(false); }} title="Import Employees" actions={<><Button variant="ghost" disabled={busy} onClick={() => setImportOpen(false)}>Close</Button><Button variant="primary" loading={busy} disabled={!importRows} onClick={importEmployees}>Import reviewed records</Button></>}><Typography variant="body2" sx={{ mb: 2 }}>Upload JSON using the existing employee fields. Review records before importing.</Typography><input ref={fileRef} type="file" accept=".json,application/json" onChange={readImport} />{importResult && <Alert severity="info" sx={{ mt: 2 }}>{importResult}</Alert>}{importRows && <pre style={{ maxHeight: 180, overflow: "auto", fontSize: 12 }}>{JSON.stringify(importRows, null, 2)}</pre>}</Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Deactivate employee?" message={deleting?.fullName} danger confirmLabel="Deactivate" loading={busy} onConfirm={remove} onClose={() => setDeleting(null)} />
  </Box>;
}
