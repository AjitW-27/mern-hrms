import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, Checkbox, InputAdornment, Menu, MenuItem, Stack, LinearProgress, TableSortLabel, Typography } from "@mui/material";
import { Add, DeleteOutline, EditOutlined, FileDownloadOutlined, FilterAltOutlined, RefreshOutlined, Search, ViewColumnOutlined, VisibilityOutlined } from "@mui/icons-material";
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, IconButton, Input, Pagination, SearchInput, Select, Skeleton } from "./UI";
import { colors } from "../../theme/designTokens";
import { downloadBlob } from "../../lib/exportUtils";

const pathValue = (row, field) => String(field || "").split(".").reduce((value, key) => value?.[key], row);
const textValue = value => value == null ? "" : typeof value === "object" ? value.fullName || value.name || value.title || JSON.stringify(value) : String(value);
const titleCase = value => String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
const addLabel = value => String(value || "").replace(/^add(?=[A-Za-z])/, "Add ").replace(/([a-z])([A-Z])/g, "$1 $2");
export default function DataTable({ columns = [], rows = [], loading = false, error, onRetry, onRefresh, config = {}, searchValue, onSearchChange, searchPlaceholder = "Search records", page, onPageChange, rowsPerPage, onRowsPerPageChange, rowsPerPageOptions = [10, 25, 50, 100], totalCount, paginationMode = "client", pagination = true, toolbar = true, toolbarLeft, toolbarActions, filters, filterFields, onFilterChange, renderGrid, addBtn, onAddClick, actions, onView, onEdit, onDelete, emptyMessage = "Create a record or adjust your filters.", fill = true, minHeight, maxHeight, getRowId = row => row._id || row.id, rowSx, pageName, minWidth, ...props }) {
  const root = useRef(null);
  const [height, setHeight] = useState(480), [query, setQuery] = useState(""), [localPage, setLocalPage] = useState(0), [size, setSize] = useState(25);
  const [hidden, setHidden] = useState([]), [anchor, setAnchor] = useState(null), [filterOpen, setFilterOpen] = useState(false), [criteria, setCriteria] = useState({}), [sort, setSort] = useState({ field: "", direction: "asc" });
  const allRows = Array.isArray(rows) ? rows : [];
  const currentQuery = searchValue ?? query, currentSize = rowsPerPage ?? size;
  const server = paginationMode === "server";
  const availableColumns = columns.filter(column => !hidden.includes(column.field || column.id));
  const retry = onRetry || onRefresh || config.onRefreshClick;
  const readCell = (row, column) => typeof column.valueGetter === "function" ? column.valueGetter(row) : pathValue(row, column.field || column.id);
  const filtered = useMemo(() => {
    if (server) return allRows;
    const result = allRows.filter(row => (!currentQuery || columns.some(column => textValue(readCell(row, column)).toLowerCase().includes(currentQuery.toLowerCase()))) && Object.entries(criteria).every(([field, value]) => !value || (String(pathValue(row, field)?._id || "") === String(value) || textValue(pathValue(row, field)).toLowerCase().includes(String(value).toLowerCase()))));
    if (sort.field) { const column = columns.find(column => column.field === sort.field); if (column) result.sort((a, b) => textValue(readCell(a, column)).localeCompare(textValue(readCell(b, column)), undefined, { numeric: true }) * (sort.direction === "asc" ? 1 : -1)); }
    return result;
  // The cell accessors are owned by the caller's columns, and are recomputed with them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, currentQuery, columns, criteria, sort, server]);
  const renderValue = (row, column) => {
    if (column.renderCell) return column.renderCell(row);
    const value = readCell(row, column);
    if (value === undefined || value === null || value === "") return "\u2014";
    if (column.type === "date") { const date = new Date(value); return Number.isNaN(date.getTime()) ? textValue(value) : date.toLocaleDateString("en-GB"); }
    if (column.type === "progress" && Number.isFinite(Number(value))) return <Stack direction="row" spacing={1} alignItems="center"><LinearProgress variant="determinate" value={Math.max(0, Math.min(100, Number(value)))} sx={{ width: 85, height: 5 }} /><Typography variant="caption">{value}%</Typography></Stack>;
    if (column.type === "money" && Number.isFinite(Number(value))) return new Intl.NumberFormat(undefined, column.currency ? { style: "currency", currency: column.currency } : {}).format(Number(value));
    if (column.type === "status" || /status|priority|employmentType/i.test(column.field)) return <Badge label={textValue(value)} />;
    if (typeof value === "boolean") return <Badge tone={value ? "success" : "danger"} label={value ? "Yes" : "No"} />;
    if (/^employee(Id)?$/.test(column.field) && value?.fullName) return <Stack direction="row" spacing={1} alignItems="center"><Avatar src={value.avatar} name={value.fullName} /><Box><Typography variant="body2" fontWeight={600}>{value.fullName}</Typography><Typography variant="caption">{value.email || value.employeeId}</Typography></Box></Stack>;
    return textValue(value);
  };
  const total = server ? Number(totalCount ?? allRows.length) : filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / currentSize));
  const currentPage = Math.min(page ?? localPage, pageCount - 1);
  const displayed = !pagination || server ? filtered : filtered.slice(currentPage * currentSize, (currentPage + 1) * currentSize);
  const changePage = (event, next) => { setLocalPage(next); onPageChange?.(event, next); };
  const changeSearch = value => { setQuery(value); setLocalPage(0); onSearchChange?.(value); };
  useLayoutEffect(() => {
    if (!fill || !root.current) return;
    const main = root.current.closest("main");
    const measure = () => { if (!root.current || !main) return; const offset = root.current.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop; setHeight(Math.max(420, main.clientHeight - offset - 12)); };
    const observer = new ResizeObserver(measure); if (main) observer.observe(main); if (root.current.parentElement) observer.observe(root.current.parentElement);
    window.addEventListener("resize", measure); measure(); return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [fill, toolbarLeft, filters]);
  const exportRecords = () => {
    if (config.onExportClick) return config.onExportClick();
    const cell = value => '"' + textValue(value).replaceAll('"', '""') + '"';
    const contents = [columns.map(column => column.headerName || column.label || column.field).map(cell).join(","), ...filtered.map(row => columns.map(column => cell(readCell(row, column))).join(","))].join("\r\n");
    downloadBlob(new Blob([contents], { type: "text/csv;charset=utf-8" }), "records.csv");
  };
  const fields = filterFields || config.filters || columns.filter(column => column.filterOptions?.length).map(column => ({ field: column.field, label: column.headerName, options: column.filterOptions }));
  const updateCriteria = next => { setCriteria(next); setLocalPage(0); onFilterChange?.(next); };
  const buttonLabel = addBtn || config.addBtn;
  const add = onAddClick || config.onAddClick;
  const hasActions = Boolean(actions || onView || onEdit || onDelete);
  return <Card ref={root} aria-label={pageName || "Records"} data-ui="data-table" {...props} sx={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: minHeight || (fill ? 420 : 220), height: fill ? height : undefined, maxHeight, overflow: "hidden", ...props.sx }}>
    {toolbar && <Stack data-ui="table-toolbar" direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5} sx={{ p: 2, borderBottom: "1px solid " + colors.border, flexShrink: 0 }}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ flex: "1 1 220px", minWidth: 0 }}>{toolbarLeft}<SearchInput value={currentQuery} onChange={event => changeSearch(event.target.value)} placeholder={searchPlaceholder} sx={{ maxWidth: 320, flex: "1 1 180px" }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /></Stack>
      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap"><IconButton aria-label="Choose columns" title="Columns" onClick={event => setAnchor(event.currentTarget)}><ViewColumnOutlined fontSize="small" /></IconButton><IconButton aria-label="Refresh records" title="Refresh" disabled={loading || !retry} onClick={retry}><RefreshOutlined fontSize="small" /></IconButton><IconButton aria-label="Filter records" title="Filter" onClick={() => config.onFilterClick ? config.onFilterClick() : setFilterOpen(!filterOpen)}><FilterAltOutlined fontSize="small" /></IconButton><IconButton aria-label="Export records" title="Export CSV" disabled={loading || Boolean(error)} onClick={exportRecords}><FileDownloadOutlined fontSize="small" /></IconButton>{toolbarActions}{buttonLabel && <Button variant="primary" startIcon={<Add />} onClick={add} disabled={!add || loading}>{addLabel(buttonLabel)}</Button>}</Stack>
    </Stack>}
    {filters}
    {filterOpen && <Stack direction="row" gap={1} flexWrap="wrap" sx={{ px: 2, pb: 2, pt: 1 }}>{(fields.length ? fields : columns.filter(column => !column.renderCell).slice(0, 3).map(column => ({ field: column.field, label: column.headerName }))).map(field => field.options ? <Select key={field.field} label={field.label} value={criteria[field.field] || ""} options={[{ value: "", label: "All" }, ...field.options.map(option => typeof option === "object" ? option : { value: option, label: option })]} onChange={event => { updateCriteria({ ...criteria, [field.field]: event.target.value }); }} sx={{ minWidth: 160, maxWidth: 220 }} /> : <Input key={field.field} size="small" label={field.label} value={criteria[field.field] || ""} onChange={event => { updateCriteria({ ...criteria, [field.field]: event.target.value }); }} sx={{ maxWidth: 220 }} />)}<Button variant="ghost" onClick={() => updateCriteria({})}>Clear filters</Button></Stack>}
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>{columns.map(column => { const field = column.field || column.id; return <MenuItem key={field} onClick={() => setHidden(hidden.includes(field) ? hidden.filter(item => item !== field) : availableColumns.length > 1 ? [...hidden, field] : hidden)}><Checkbox checked={!hidden.includes(field)} size="small" />{column.headerName || column.label || titleCase(field)}</MenuItem>; })}</Menu>
    <Box className="ui-table-scroll" sx={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
      {renderGrid && !loading && !error && displayed.length ? renderGrid(displayed) : <table className="ui-table" style={{ minWidth: Math.max(availableColumns.reduce((sum, column) => sum + (column.minWidth || 130), 0) + (hasActions ? 120 : 0), minWidth || 400), flexShrink: 0 }}>
        <thead><tr>{availableColumns.map(column => <th key={column.field || column.id} style={{ textAlign: column.align || "left", width: column.width }}><TableSortLabel active={sort.field === column.field} direction={sort.direction} disabled={server || column.sortable === false} onClick={() => setSort({ field: column.field, direction: sort.field === column.field && sort.direction === "asc" ? "desc" : "asc" })}>{titleCase(column.headerName || column.label || column.field)}</TableSortLabel></th>)}{hasActions && <th style={{ textAlign: "right" }}>Actions</th>}</tr></thead>
        <tbody>{loading ? Array.from({ length: Math.min(6, currentSize) }, (_, index) => <tr key={index}>{availableColumns.map((column, cell) => <td key={cell}><Skeleton width="85%" height={22} /></td>)}{hasActions && <td><Skeleton width={70} /></td>}</tr>) : error || !displayed.length ? null : displayed.map((row, index) => <tr key={getRowId(row) || index} style={rowSx?.(row)}>{availableColumns.map(column => <td key={column.field || column.id} style={{ textAlign: column.align || "left", ...column.cellStyle }}>{renderValue(row, column)}</td>)}{hasActions && <td style={{ textAlign: "right", whiteSpace: "nowrap" }}><Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">{onView && <IconButton size="small" aria-label="View record" onClick={() => onView(row)}><VisibilityOutlined fontSize="small" /></IconButton>}{onEdit && <IconButton size="small" aria-label="Edit record" onClick={() => onEdit(row)}><EditOutlined fontSize="small" /></IconButton>}{onDelete && <IconButton size="small" color="error" aria-label="Delete record" onClick={() => onDelete(row)}><DeleteOutline fontSize="small" /></IconButton>}{typeof actions === "function" ? actions(row) : actions}</Stack></td>}</tr>)}</tbody>
      </table>}
      {!loading && (error || !displayed.length) && <Box sx={{ position: "sticky", left: 0, width: "100%", flex: "1 0 240px", display: "flex", alignItems: "center", justifyContent: "center" }}>{error ? <ErrorState error={error} onRetry={retry} /> : <EmptyState description={emptyMessage} />}</Box>}
    </Box>
    {pagination && <Stack data-ui="table-footer" direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ p: 1.5, borderTop: "1px solid " + colors.border, flexShrink: 0 }}><Typography variant="caption">{total ? currentPage * currentSize + 1 : 0} to {Math.min((currentPage + 1) * currentSize, total)} of {total}</Typography><Stack direction="row" alignItems="center" spacing={1}><Select size="small" value={currentSize} onChange={event => { const next = Number(event.target.value); setSize(next); setLocalPage(0); onRowsPerPageChange?.(event); }} inputProps={{ "aria-label": "Rows per page" }}>{[...new Set([...rowsPerPageOptions, currentSize])].sort((a, b) => a - b).map(value => <MenuItem key={value} value={value}>{value} per page</MenuItem>)}</Select><Pagination page={currentPage + 1} count={pageCount} onChange={(event, next) => changePage(event, next - 1)} siblingCount={0} boundaryCount={1} /></Stack></Stack>}
  </Card>;
}
