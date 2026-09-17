import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  Drawer,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "../../lib/api";
import PageHeader from "./PageHeader";
import TableFilter from "./TableFilter";

const DASH = "-";

const initialForField = (field) => {
  if (field.type === "number") return "";
  if (field.type === "date") return "";
  return field.defaultValue ?? "";
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.projects)) return data.projects;
  if (Array.isArray(data?.payrolls)) return data.payrolls;
  return [];
};

const clampPercent = (value) => Math.min(Math.max(Number(value) || 0, 0), 100);

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return DASH;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusColor = (value = "") => {
  const normalized = String(value).toLowerCase();
  if (
    ["active", "approved", "paid", "completed", "achieved", "available"].some(
      (item) => normalized.includes(item),
    )
  )
    return "success";
  if (
    ["pending", "draft", "planned", "in progress", "review"].some((item) =>
      normalized.includes(item),
    )
  )
    return "warning";
  if (
    ["blocked", "rejected", "hold", "poor", "inactive"].some((item) =>
      normalized.includes(item),
    )
  )
    return "error";
  return "default";
};

const normalizeValue = (field, value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
};

const getNested = (row, field) => {
  if (!field) return undefined;
  return field.split(".").reduce((value, key) => value?.[key], row);
};

const CrudPage = ({ config, transformItem, extraActions, onAfterSave }) => {
  const {
    title,
    description,
    endpoint,
    mutationEndpoint,
    createEndpoint,
    columns,
    fields,
    metrics = [],
    searchable = true,
    filters = [],
  } = config;
  const writeEndpoint = mutationEndpoint || endpoint;
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [optionSets, setOptionSets] = useState({});
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [error, setError] = useState("");

  const emptyForm = useMemo(() => {
    const shape = {};
    fields.forEach((field) => {
      shape[field.name] = initialForField(field);
    });
    return shape;
  }, [fields]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(endpoint);
      const list = getList(data);
      setRows(transformItem ? list.map(transformItem) : list);
    } catch (err) {
      setRows([]);
      setError(
        err?.response?.data?.message ||
          `Unable to load ${title.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  useEffect(() => {
    const fetchOptions = async () => {
      const sources = fields.filter((field) => field.optionsEndpoint);
      if (!sources.length) return;
      const results = await Promise.all(
        sources.map(async (field) => {
          const { data } = await api.get(field.optionsEndpoint);
          return [field.name, getList(data)];
        }),
      );
      setOptionSets(Object.fromEntries(results));
    };
    fetchOptions().catch(() => {});
  }, [fields]);

  const summary = useMemo(() => {
    if (metrics.length) {
      return metrics.map((metric) => ({
        ...metric,
        value: metric.compute
          ? metric.compute(rows)
          : rows.filter((row) => row[metric.field] === metric.match).length,
      }));
    }
    return [
      { label: "Total Records", value: rows.length, tone: "#38bdf8" },
      {
        label: "Active",
        value: rows.filter((row) =>
          String(row.status || "")
            .toLowerCase()
            .includes("active"),
        ).length,
        tone: "#22c55e",
      },
      {
        label: "Pending",
        value: rows.filter((row) =>
          /pending|draft|planned|review/i.test(String(row.status || "")),
        ).length,
        tone: "#f59e0b",
      },
    ];
  }, [metrics, rows]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        columns.some((column) =>
          String(displayValue(row, column)).toLowerCase().includes(term),
        );

      const matchesQuickFilters = filters.every((filter) => {
        const selected = filterValues[filter.field];
        return (
          !selected ||
          String(getNested(row, filter.field) ?? row[filter.field] ?? "") === selected
        );
      });

      if (!advancedFilter?.field || advancedFilter.value === "" || advancedFilter.value == null) {
        return matchesSearch && matchesQuickFilters;
      }

      const raw = advancedFilter.field
        .split(".")
        .reduce((value, key) => value?.[key], row);
      const actual = String(raw ?? "").toLowerCase();
      const expected = String(advancedFilter.value ?? "").toLowerCase();
      const numericActual = Number(raw);
      const numericExpected = Number(advancedFilter.value);

      let matchesAdvanced = true;
      if (advancedFilter.type === "number" && Number.isFinite(numericExpected)) {
        if (advancedFilter.operator === "equals") matchesAdvanced = numericActual === numericExpected;
        else if (advancedFilter.operator === "notEquals") matchesAdvanced = numericActual !== numericExpected;
        else if (advancedFilter.operator === "contains") matchesAdvanced = actual.includes(expected);
        else matchesAdvanced = !actual.includes(expected);
      } else if (advancedFilter.type === "date") {
        const actualDate = raw ? new Date(raw).toISOString().slice(0, 10) : "";
        if (advancedFilter.operator === "equals") matchesAdvanced = actualDate === expected;
        else if (advancedFilter.operator === "notEquals") matchesAdvanced = actualDate !== expected;
        else if (advancedFilter.operator === "contains") matchesAdvanced = actualDate.includes(expected);
        else matchesAdvanced = !actualDate.includes(expected);
      } else if (advancedFilter.operator === "equals") matchesAdvanced = actual === expected;
      else if (advancedFilter.operator === "notEquals") matchesAdvanced = actual !== expected;
      else if (advancedFilter.operator === "contains") matchesAdvanced = actual.includes(expected);
      else if (advancedFilter.operator === "notContains") matchesAdvanced = !actual.includes(expected);

      return matchesSearch && matchesQuickFilters && matchesAdvanced;
    });
  }, [advancedFilter, columns, filterValues, filters, query, rows]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    const next = { ...emptyForm };
    fields.forEach((field) => {
      const value = getNested(item, field.name) ?? item?.[field.name];
      if (field.type === "date" && value) {
        next[field.name] = new Date(value).toISOString().slice(0, 10);
      } else {
        next[field.name] = Array.isArray(value)
          ? value.join(", ")
          : (value ?? "");
      }
    });
    setEditing(item);
    setForm(next);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const buildPayload = () => {
    const payload = {};
    fields.forEach((field) => {
      const value = form[field.name];
      if (field.readOnly) return;
      if (field.type === "number")
        payload[field.name] = value === "" ? 0 : Number(value);
      else if (
        field.type === "array" ||
        field.name === "members" ||
        field.name === "participants"
      ) {
        payload[field.name] = String(value || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else {
        payload[field.name] = value;
      }
    });
    return payload;
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      if (editing?._id)
        await api.put(`${writeEndpoint}/${editing._id}`, payload);
      else await api.post(createEndpoint || writeEndpoint, payload);
      await onAfterSave?.(payload, editing);
      await load();
      close();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Save failed. Please check required fields and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (
      !window.confirm(`Delete this ${title.slice(0, -1).toLowerCase()} record?`)
    )
      return;
    setError("");
    try {
      await api.delete(`${writeEndpoint}/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed.");
    }
  };

  function displayValue(row, column) {
    const raw = column.valueGetter
      ? column.valueGetter(row)
      : (getNested(row, column.field) ?? row[column.field]);
    if (column.type === "money") return formatMoney(raw);
    if (column.type === "date")
      return raw ? new Date(raw).toLocaleDateString() : DASH;
    if (column.field === "employeeName")
      return (
        row.employee?.fullName ||
        row.employeeId?.fullName ||
        row.employee?.employeeId ||
        row.employee ||
        DASH
      );
    if (column.field === "assignedEmployee")
      return row.assignedTo?.fullName || row.assignedEmployee || "Unassigned";
    if (
      ["date", "startDate", "endDate", "dueDate", "joiningDate"].includes(
        column.field,
      )
    )
      return raw ? new Date(raw).toLocaleDateString() : DASH;
    if (Array.isArray(raw)) return raw.join(", ");
    return raw ?? DASH;
  }

  const renderCell = (row, column) => {
    const value = displayValue(row, column);
    if (
      column.type === "progress" ||
      column.field === "progress" ||
      column.field === "completion"
    ) {
      const percent = clampPercent(value);
      return (
        <Stack spacing={0.7} sx={{ minWidth: 130 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={800}>
              {percent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{ height: 7, borderRadius: 999 }}
          />
        </Stack>
      );
    }
    if (column.field === "status" || column.type === "status") {
      return (
        <Chip
          size="small"
          color={statusColor(value)}
          label={String(value || DASH)}
          sx={{ fontWeight: 800 }}
        />
      );
    }
    if (column.field === "priority") {
      return (
        <Chip
          size="small"
          variant="outlined"
          color={statusColor(value === "Critical" ? "blocked" : value)}
          label={String(value || DASH)}
        />
      );
    }
    return (
      <Typography variant="body2" sx={{ fontWeight: column.bold ? 800 : 500 }}>
        {String(value)}
      </Typography>
    );
  };

  const FormShell = Drawer;
  const formShellProps = {
    anchor: "right",
    PaperProps: {
      sx: {
        width: { xs: "100%", sm: 520, md: 720 },
        maxWidth: "100%",
        height: "100%",
        borderRadius: 0,
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      },
    },
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <PageHeader
        title={title}
        description={description}
        actionLabel={`Add ${title.endsWith("s") ? title.slice(0, -1) : title}`}
        onAction={openCreate}
        actionIcon={AddRoundedIcon}
      />

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {summary.map((item) => (
          <Grid item xs={12} sm={4} key={item.label}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${item.tone || "#3456d1"}12, #fff)`,
                border: "1px solid #e5e7ef",
              }}
            >
              <CardContent sx={{ py: 2.2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mt: 0.5, fontWeight: 700, color: "text.primary" }}
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          boxShadow: "0 1px 2px rgba(16,24,40,.04)",
          border: "1px solid #e5e7ef",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ mb: 2 }}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
          >
            {searchable ? (
              <TextField
                size="small"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                sx={{ width: { xs: "100%", md: 360 }, minWidth: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <Box />
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
              {filters.map((filter) => (
                <TextField
                  key={filter.field}
                  select
                  size="small"
                  label={filter.label}
                  value={filterValues[filter.field] || ""}
                  onChange={(event) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      [filter.field]: event.target.value,
                    }))
                  }
                  sx={{ minWidth: { sm: 160 }, width: { xs: "100%", sm: "auto" } }}
                >
                  <MenuItem value="">All</MenuItem>
                  {filter.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
              <TableFilter
                columns={columns}
                value={advancedFilter}
                onApply={setAdvancedFilter}
                onClear={() => setAdvancedFilter(null)}
              />
            </Stack>
          </Stack>

          {error ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              border: "1px solid #e5e7ef",
            }}
          >
            <Table sx={{ minWidth: { xs: 720, md: "auto" } }}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                      {column.headerName}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, width: 150 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} sx={{ py: 5 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow
                      key={row._id || row.id || JSON.stringify(row)}
                      hover
                      sx={{ "& td": { py: 1.5 } }}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.field}>
                          {renderCell(row, column)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Stack direction="row" spacing={0.75}>
                          {extraActions?.(row, load)}
                          <IconButton
                            size="small"
                            onClick={() => openEdit(row)}
                            sx={{ bgcolor: "#eef2ff", borderRadius: 1 }}
                          >
                            <EditRoundedIcon fontSize="inherit" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => remove(row._id)}
                            sx={{ bgcolor: "#fff1f1", borderRadius: 1 }}
                          >
                            <DeleteRoundedIcon fontSize="inherit" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && !filteredRows.length ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1}>
                      <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography variant="h6" fontWeight={900}>
                          No records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create the first record or adjust your search/filter.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>{editing ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} md={compactForm ? (field.multiline ? 12 : 6) : (field.md || 6)} key={field.name}>
                <TextField
                  fullWidth
                  size="small"
                  label={field.label}
                  value={normalizeValue(field, form[field.name])}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  select={Boolean(field.options || field.optionsEndpoint)}
                  type={field.type === "date" ? "date" : field.type === "array" ? "text" : field.type || "text"}
                  multiline={Boolean(field.multiline)}
                  minRows={field.rows || (field.multiline ? 3 : undefined)}
                  required={field.required}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                  InputProps={{ sx: { minHeight: field.multiline ? undefined : 44 } }}
                >
                  {(field.options || optionSets[field.name] || []).map((option) => {
                    if (typeof option === "string") return <MenuItem key={option} value={option}>{option}</MenuItem>;
                    const value = option[field.optionValueKey || "_id"];
                    const labelPrimary = option[field.optionLabelKey || "name"] || value;
                    const labelSecondary = field.optionSecondaryKey ? option[field.optionSecondaryKey] : "";
                    return <MenuItem key={String(value)} value={String(value)}>{labelSecondary ? `${labelPrimary} - ${labelSecondary}` : labelPrimary}</MenuItem>;
                  })}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={saving} startIcon={<SaveRoundedIcon />}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog> */}
      <FormShell open={open} onClose={close} {...formShellProps}>
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            flexShrink: 0,
            px: { xs: 2., sm: 1.5 },
            py: 2,
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box>
          <Typography
            fontSize={{ xs: 18, sm: 20 }}
            fontWeight={700}
            color="#0f172a"
          >
            {editing ? `Edit ${title}` : `Add ${title}`}
          </Typography>

          <Typography fontSize={13} color="#64748b" mt={0.5}>
            {editing
              ? `Update the details of this ${title
                  .slice(0, -1)
                  .toLowerCase()}.`
              : `Enter the required details to create a new ${title
                  .slice(0, -1)
                  .toLowerCase()}.`}
          </Typography>
            </Box>
            <IconButton onClick={close} size="small" aria-label="Close drawer">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Form Content */}
        <DialogContent
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            mt:2,
            px: { xs: 1, sm: 1.5 },
            py: 2,
            background: "#f8fafc",

            "&::-webkit-scrollbar": {
              width: "6px",
            },

            "&::-webkit-scrollbar-track": {
              background: "#f1f5f9",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "4px",
            },

            "&::-webkit-scrollbar-thumb:hover": {
              background: "#94a3b8",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              background: `
      radial-gradient(
        circle at 0% 0%,
        rgba(139, 92, 246, 0.06) 0%,
        transparent 45%
      ),
      linear-gradient(
        135deg,
        #ffffff 0%,
        #f8fafc 100%
      )
    `,
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              p: { xs: 2, sm: 2.5 },
            }}
          >
            <Grid container spacing={2.5}>
              {fields.map((field) => (
                <Grid item xs={12} md={field.md || 6} key={field.name}>
                  <TextField
                    fullWidth
                    size="small"
                    label={field.label}
                    value={normalizeValue(field, form[field.name])}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: event.target.value,
                      }))
                    }
                    select={Boolean(field.options || field.optionsEndpoint)}
                    type={
                      field.type === "date"
                        ? "date"
                        : field.type === "array"
                          ? "text"
                          : field.type || "text"
                    }
                    multiline={Boolean(field.multiline)}
                    minRows={field.rows || (field.multiline ? 3 : undefined)}
                    required={field.required}
                    placeholder={field.placeholder}
                    helperText={field.helperText}
                    InputLabelProps={
                      field.type === "date" ? { shrink: true } : undefined
                    }
                    InputProps={{
                      sx: {
                        minHeight: field.multiline ? undefined : 44,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#ffffff",
                        borderRadius: "4px",
                        color: "#0f172a",

                        "& fieldset": {
                          borderColor: "#e2e8f0",
                        },

                        "&:hover fieldset": {
                          borderColor: "#cbd5e1",
                        },

                        "&.Mui-focused fieldset": {
                          borderColor: "#8b5cf6",
                          borderWidth: "2px",
                        },
                      },

                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        fontSize: "14px",
                      },

                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#8b5cf6",
                      },

                      "& input": {
                        color: "#0f172a",
                      },

                      "& textarea": {
                        color: "#0f172a",
                      },

                      "& input::placeholder": {
                        color: "#94a3b8",
                        opacity: 1,
                      },

                      "& .MuiFormHelperText-root": {
                        color: "#64748b",
                        marginLeft: 0,
                        fontSize: "12px",
                      },

                      "& .MuiSvgIcon-root": {
                        color: "#64748b",
                      },
                    }}
                  >
                    {(field.options || optionSets[field.name] || []).map(
                      (option) => {
                        if (typeof option === "string") {
                          return (
                            <MenuItem
                              key={option}
                              value={option}
                              sx={{
                                fontSize: 14,
                                color: "#0f172a",
                                py: 1,
                                "&:hover": {
                                  backgroundColor: "#f8fafc",
                                },
                                "&.Mui-selected": {
                                  backgroundColor: "#ede9fe",
                                  color: "#7c3aed",
                                },
                              }}
                            >
                              {option}
                            </MenuItem>
                          );
                        }

                        const value = option[field.optionValueKey || "_id"];

                        const labelPrimary =
                          option[field.optionLabelKey || "name"] || value;

                        const labelSecondary = field.optionSecondaryKey
                          ? option[field.optionSecondaryKey]
                          : "";

                        return (
                          <MenuItem
                            key={String(value)}
                            value={String(value)}
                            sx={{
                              fontSize: 14,
                              color: "#0f172a",
                              py: 1,
                              "&:hover": {
                                backgroundColor: "#f8fafc",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#ede9fe",
                                color: "#7c3aed",
                              },
                            }}
                          >
                            {labelSecondary
                              ? `${labelPrimary} - ${labelSecondary}`
                              : labelPrimary}
                          </MenuItem>
                        );
                      },
                    )}
                  </TextField>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            flexShrink: 0,
            px: { xs: 2.5, sm: 3 },
            py: 1.5,
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            gap: 1.5,

            "@media (max-width: 500px)": {
              flexDirection: "column-reverse",
              alignItems: "stretch",

              "& button": {
                width: "100%",
              },
            },
          }}
        >
          <Button
            onClick={close}
            sx={{
              height: 42,
              px: 3,
              borderRadius: "4px",
              color: "#475569",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              textTransform: "none",
              fontWeight: 600,

              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#cbd5e1",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={submit}
            disabled={saving}
            startIcon={<SaveRoundedIcon />}
            sx={{
              height: 42,
              px: 2,
              borderRadius: "4px",
              backgroundColor: "#8b5cf6",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#7c3aed",
                boxShadow: "0 6px 16px rgba(139, 92, 246, 0.18)",
              },

              "&:disabled": {
                backgroundColor: "#c4b5fd",
                color: "#ffffff",
              },
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </FormShell>
    </Box>
  );
};

export default CrudPage;
