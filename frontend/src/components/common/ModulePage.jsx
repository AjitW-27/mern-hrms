// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Box,
//   Button,
//   Drawer,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Select,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import AddRoundedIcon from "@mui/icons-material/AddRounded";
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import DataGrid from "./DataGrid";
// import PageHeader from "./PageHeader";
// import execReq from "../../lib/execReq";

// const getList = (response) =>
//   response?.data?.data || response?.data?.items || response?.data?.rows || [];
// const nested = (row, path) =>
//   String(path || "")
//     .split(".")
//     .reduce((v, key) => v?.[key], row);
// const initialValue = (field) =>
//   field.defaultValue ?? (field.type === "array" ? "" : "");

// const ModulePage = ({
//   config,
//   transformItem,
//   extraActions,
//   breadcrumbs = [],
//   hideHeader = false,
// }) => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({});
//   const [optionSets, setOptionSets] = useState({});
//   const fields = config.fields || [];
//   const endpoint = config.endpoint;
//   const writeEndpoint = config.mutationEndpoint || endpoint;
//   const canCreate = config.canCreate !== false;
//   const canEdit = config.canEdit !== false;
//   const canDelete = config.canDelete !== false;
//   const emptyForm = useMemo(
//     () => Object.fromEntries(fields.map((f) => [f.name, initialValue(f)])),
//     [fields],
//   );

//   const load = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await execReq(endpoint);
//       const list = getList(response);
//       setRows(transformItem ? list.map(transformItem) : list);
//     } catch (e) {
//       setRows([]);
//       setError(
//         e?.response?.data?.message ||
//           `Unable to load ${config.title.toLowerCase()}.`,
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     load();
//   }, [endpoint]);
//   useEffect(() => {
//     let active = true;
//     Promise.all(
//       fields
//         .filter((f) => f.optionsEndpoint)
//         .map(async (f) => [f.name, getList(await execReq(f.optionsEndpoint))]),
//     )
//       .then((pairs) => active && setOptionSets(Object.fromEntries(pairs)))
//       .catch(() => {});
//     return () => {
//       active = false;
//     };
//   }, [fields]);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm);
//     setError("");
//     setDrawerOpen(true);
//   };
//   const openEdit = (row) => {
//     const next = { ...emptyForm };
//     fields.forEach((f) => {
//       const value = nested(row, f.name) ?? row[f.name];
//       next[f.name] =
//         ["date", "datetime-local"].includes(f.type) && value
//           ? f.type === "datetime-local"
//             ? new Date(value).toISOString().slice(0, 16)
//             : new Date(value).toISOString().slice(0, 10)
//           : Array.isArray(value)
//             ? value.join(", ")
//             : (value ?? "");
//     });
//     setEditing(row);
//     setForm(next);
//     setError("");
//     setDrawerOpen(true);
//   };
//   const close = () => {
//     if (!saving) {
//       setDrawerOpen(false);
//       setEditing(null);
//     }
//   };
//   const submit = async () => {
//     const required = fields.find(
//       (f) => f.required && !String(form[f.name] ?? "").trim(),
//     );
//     if (required) {
//       setError(`${required.label || required.name} is required.`);
//       return;
//     }
//     setSaving(true);
//     setError("");
//     try {
//       const payload = {};
//       fields.forEach((f) => {
//         if (f.readOnly) return;
//         const value = form[f.name];
//         if (f.type === "number")
//           payload[f.name] = value === "" ? 0 : Number(value);
//         else if (
//           f.type === "array" ||
//           f.name === "members" ||
//           f.name === "participants"
//         )
//           payload[f.name] = String(value || "")
//             .split(",")
//             .map((x) => x.trim())
//             .filter(Boolean);
//         else payload[f.name] = value;
//       });
//       if (editing?._id)
//         await execReq.put(`${writeEndpoint}/${editing._id}`, payload);
//       else await execReq.post(config.createEndpoint || writeEndpoint, payload);
//       await load();
//       close();
//     } catch (e) {
//       setError(
//         e?.response?.data?.message ||
//           "Save failed. Check the form and try again.",
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const remove = async (row) => {
//     if (
//       !window.confirm(
//         `Delete this ${config.title.replace(/s$/, "").toLowerCase()}?`,
//       )
//     )
//       return;
//     try {
//       await execReq.delete(`${writeEndpoint}/${row._id}`);
//       await load();
//     } catch (e) {
//       setError(e?.response?.data?.message || "Delete failed.");
//     }
//   };

//   const columns = config.columns.map((column) => ({
//     ...column,
//     filterOptions: column.filterOptions || undefined,
//   }));
//   const filters =
//     config.filters ||
//     columns
//       .filter((c) => c.filterOptions?.length)
//       .map((c) => ({
//         field: c.field,
//         label: c.headerName,
//         options: c.filterOptions,
//       }));

//   return (
//     <Box>
//       {!hideHeader && (
//         <PageHeader
//           title={config.title}
//           breadcrumbs={breadcrumbs}
//           actionLabel={
//             canCreate
//               ? config.actionLabel || `Add ${config.title.replace(/s$/, "")}`
//               : undefined
//           }
//           onAction={canCreate ? openCreate : undefined}
//           actionIcon={AddRoundedIcon}
//         />
//       )}
//       {error && (
//         <Alert
//           severity="error"
//           onClose={() => setError("")}
//           sx={{ mb: 2, borderRadius: 8 }}
//         >
//           {error}
//         </Alert>
//       )}
//       <DataGrid
//         rows={rows}
//         loading={loading}
//         error={error && rows.length === 0 ? error : ""}
//         columns={columns}
//         pageName={config.title}
//         searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
//         filterFields={filters}
//         onRefresh={load}
//         actions={
//           canEdit || canDelete || extraActions
//             ? (row) => (
//                 <>
//                   {canEdit && (
//                     <IconButton
//                       aria-label="Edit"
//                       onClick={() => openEdit(row)}
//                       sx={{ width: 36, height: 36, color: "#4F46E5" }}
//                     >
//                       <EditOutlinedIcon sx={{ fontSize: 20 }} />
//                     </IconButton>
//                   )}
//                   {canDelete && (
//                     <IconButton
//                       aria-label="Delete"
//                       onClick={() => remove(row)}
//                       sx={{ width: 36, height: 36, color: "#EF4444" }}
//                     >
//                       <DeleteOutlineIcon sx={{ fontSize: 20 }} />
//                     </IconButton>
//                   )}
//                   {extraActions ? extraActions(row, load) : null}
//                 </>
//               )
//             : undefined
//         }
//       />
//       <Drawer
//         anchor="right"
//         open={drawerOpen}
//         onClose={close}
//         PaperProps={{
//           sx: {
//             width: { xs: "100%", sm: 520 },
//             boxShadow:
//               "0 24px 44px -12px rgba(15,23,42,.22), 0 4px 16px -4px rgba(15,23,42,.08)",
//           },
//         }}
//       >
//         <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
//           <Box
//             sx={{
//               p: 3,
//               borderBottom: "1px solid #E2E8F0",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "flex-start",
//             }}
//           >
//             <Box>
//               <Typography
//                 sx={{ fontSize: 18, fontWeight: 600, color: "#1E293B" }}
//               >
//                 {editing
//                   ? `Edit ${config.title.replace(/s$/, "")}`
//                   : `Add ${config.title.replace(/s$/, "")}`}
//               </Typography>
//             </Box>
//             <IconButton onClick={close} aria-label="Close">
//               <CloseRoundedIcon />
//             </IconButton>
//           </Box>
//           <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
//             <Grid container spacing={2}>
//               {fields.map((field) => (
//                 <Grid item xs={12} md={field.md || 6} key={field.name}>
//                   {field.optionsEndpoint || field.options ? (
//                     <FormControl fullWidth size="small">
//                       <InputLabel>{field.label}</InputLabel>
//                       <Select
//                         label={field.label}
//                         value={form[field.name] ?? ""}
//                         onChange={(e) =>
//                           setForm((v) => ({
//                             ...v,
//                             [field.name]: e.target.value,
//                           }))
//                         }
//                       >
//                         {(optionSets[field.name] || field.options || []).map(
//                           (option) => {
//                             const value =
//                               typeof option === "object"
//                                 ? (option[field.optionValueKey || "_id"] ??
//                                   option.value ??
//                                   option.code ??
//                                   option.name)
//                                 : option;
//                             const label =
//                               typeof option === "object"
//                                 ? (option[field.optionLabelKey || "name"] ??
//                                   option.label ??
//                                   option.value ??
//                                   option.code)
//                                 : option;
//                             return (
//                               <MenuItem key={String(value)} value={value}>
//                                 {label}
//                                 {typeof option === "object" &&
//                                 field.optionSecondaryKey &&
//                                 option[field.optionSecondaryKey]
//                                   ? ` · ${option[field.optionSecondaryKey]}`
//                                   : ""}
//                               </MenuItem>
//                             );
//                           },
//                         )}
//                       </Select>
//                     </FormControl>
//                   ) : (
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label={field.label}
//                       type={
//                         field.type === "number"
//                           ? "number"
//                           : ["date", "datetime-local"].includes(field.type)
//                             ? field.type
//                             : field.type === "email"
//                               ? "email"
//                               : "text"
//                       }
//                       InputLabelProps={
//                         ["date", "datetime-local"].includes(field.type)
//                           ? { shrink: true }
//                           : undefined
//                       }
//                       multiline={field.multiline}
//                       minRows={field.rows}
//                       placeholder={field.placeholder}
//                       value={form[field.name] ?? ""}
//                       onChange={(e) =>
//                         setForm((v) => ({ ...v, [field.name]: e.target.value }))
//                       }
//                       required={field.required}
//                     />
//                   )}
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//           <Stack
//             direction="row"
//             justifyContent="flex-end"
//             spacing={1}
//             sx={{ p: 2.5, borderTop: "1px solid #E2E8F0" }}
//           >
//             <Button onClick={close} variant="outlined">
//               Cancel
//             </Button>
//             <Button onClick={submit} disabled={saving} variant="contained">
//               {saving ? "Saving..." : "Save"}
//             </Button>
//           </Stack>
//         </Box>
//       </Drawer>
//     </Box>
//   );
// };

// export default ModulePage;
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DataGrid from "./DataGrid";
import PageHeader from "./PageHeader";
import execReq from "../../lib/execReq";

const getList = (response) =>
  response?.data?.data || response?.data?.items || response?.data?.rows || [];
const nested = (row, path) =>
  String(path || "")
    .split(".")
    .reduce((v, key) => v?.[key], row);
const initialValue = (field) =>
  field.defaultValue ?? (field.type === "array" ? "" : "");

const ModulePage = ({
  config,
  transformItem,
  extraActions,
  breadcrumbs = [],
  hideHeader = false,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [optionSets, setOptionSets] = useState({});
  const fields = config.fields || [];
  const endpoint = config.endpoint;
  const writeEndpoint = config.mutationEndpoint || endpoint;
  const canCreate = config.canCreate !== false;
  const canEdit = config.canEdit !== false;
  const canDelete = config.canDelete !== false;
  const emptyForm = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, initialValue(f)])),
    [fields],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await execReq(endpoint);
      const list = getList(response);
      setRows(transformItem ? list.map(transformItem) : list);
    } catch (e) {
      setRows([]);
      setError(
        e?.response?.data?.message ||
          `Unable to load ${config.title.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [endpoint]);
  useEffect(() => {
    let active = true;
    Promise.all(
      fields
        .filter((f) => f.optionsEndpoint)
        .map(async (f) => [f.name, getList(await execReq(f.optionsEndpoint))]),
    )
      .then((pairs) => active && setOptionSets(Object.fromEntries(pairs)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [fields]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDrawerOpen(true);
  };
  const openEdit = (row) => {
    const next = { ...emptyForm };
    fields.forEach((f) => {
      const value = nested(row, f.name) ?? row[f.name];
      next[f.name] =
        ["date", "datetime-local"].includes(f.type) && value
          ? f.type === "datetime-local"
            ? new Date(value).toISOString().slice(0, 16)
            : new Date(value).toISOString().slice(0, 10)
          : Array.isArray(value)
            ? value.join(", ")
            : (value ?? "");
    });
    setEditing(row);
    setForm(next);
    setError("");
    setDrawerOpen(true);
  };
  const close = () => {
    if (!saving) {
      setDrawerOpen(false);
      setEditing(null);
    }
  };
  const submit = async () => {
    const required = fields.find(
      (f) => f.required && !String(form[f.name] ?? "").trim(),
    );
    if (required) {
      setError(`${required.label || required.name} is required.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {};
      fields.forEach((f) => {
        if (f.readOnly) return;
        const value = form[f.name];
        if (f.type === "number")
          payload[f.name] = value === "" ? 0 : Number(value);
        else if (
          f.type === "array" ||
          f.name === "members" ||
          f.name === "participants"
        )
          payload[f.name] = String(value || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
        else payload[f.name] = value;
      });
      if (editing?._id)
        await execReq.put(`${writeEndpoint}/${editing._id}`, payload);
      else await execReq.post(config.createEndpoint || writeEndpoint, payload);
      await load();
      close();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Save failed. Check the form and try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row) => {
    if (
      !window.confirm(
        `Delete this ${config.title.replace(/s$/, "").toLowerCase()}?`,
      )
    )
      return;
    try {
      await execReq.delete(`${writeEndpoint}/${row._id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed.");
    }
  };

  const columns = config.columns.map((column) => ({
    ...column,
    filterOptions: column.filterOptions || undefined,
  }));
  const filters =
    config.filters ||
    columns
      .filter((c) => c.filterOptions?.length)
      .map((c) => ({
        field: c.field,
        label: c.headerName,
        options: c.filterOptions,
      }));

  // Resolve Add Button Label from config (e.g. config.addBtn = "addproject")
  const resolvedAddBtn = canCreate
    ? config.addBtn ||
      config.actionLabel ||
      `Add ${config.title.replace(/s$/, "")}`
    : undefined;

  return (
    <Box>
      {!hideHeader && (
        <PageHeader
          title={config.title}
          breadcrumbs={breadcrumbs}
          // Action button removed from top header to move into DataGrid toolbar
        />
      )}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2, borderRadius: 8 }}
        >
          {error}
        </Alert>
      )}
      <DataGrid
        rows={rows}
        loading={loading}
        error={error && rows.length === 0 ? error : ""}
        columns={columns}
        pageName={config.title}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
        filterFields={filters}
        onRefresh={load}
        addBtn={resolvedAddBtn}
        onAddClick={canCreate ? openCreate : undefined}
        config={{
          ...config,
          addBtn: resolvedAddBtn,
          onAddClick: canCreate ? openCreate : undefined,
        }}
        actions={
          canEdit || canDelete || extraActions
            ? (row) => (
                <>
                  {canEdit && (
                    <IconButton
                      aria-label="Edit"
                      onClick={() => openEdit(row)}
                      sx={{ width: 36, height: 36, color: "#4F46E5" }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                  {canDelete && (
                    <IconButton
                      aria-label="Delete"
                      onClick={() => remove(row)}
                      sx={{ width: 36, height: 36, color: "#EF4444" }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                  {extraActions ? extraActions(row, load) : null}
                </>
              )
            : undefined
        }
      />
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={close}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520 },
            boxShadow:
              "0 24px 44px -12px rgba(15,23,42,.22), 0 4px 16px -4px rgba(15,23,42,.08)",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: 18, fontWeight: 600, color: "#1E293B" }}
              >
                {editing
                  ? `Edit ${config.title.replace(/s$/, "")}`
                  : `Add ${config.title.replace(/s$/, "")}`}
              </Typography>
            </Box>
            <IconButton onClick={close} aria-label="Close">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid item xs={12} md={field.md || 6} key={field.name}>
                  {field.optionsEndpoint || field.options ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        label={field.label}
                        value={form[field.name] ?? ""}
                        onChange={(e) =>
                          setForm((v) => ({
                            ...v,
                            [field.name]: e.target.value,
                          }))
                        }
                      >
                        {(optionSets[field.name] || field.options || []).map(
                          (option) => {
                            const value =
                              typeof option === "object"
                                ? (option[field.optionValueKey || "_id"] ??
                                  option.value ??
                                  option.code ??
                                  option.name)
                                : option;
                            const label =
                              typeof option === "object"
                                ? (option[field.optionLabelKey || "name"] ??
                                  option.label ??
                                  option.value ??
                                  option.code)
                                : option;
                            return (
                              <MenuItem key={String(value)} value={value}>
                                {label}
                                {typeof option === "object" &&
                                field.optionSecondaryKey &&
                                option[field.optionSecondaryKey]
                                  ? ` · ${option[field.optionSecondaryKey]}`
                                  : ""}
                              </MenuItem>
                            );
                          },
                        )}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      label={field.label}
                      type={
                        field.type === "number"
                          ? "number"
                          : ["date", "datetime-local"].includes(field.type)
                            ? field.type
                            : field.type === "email"
                              ? "email"
                              : "text"
                      }
                      InputLabelProps={
                        ["date", "datetime-local"].includes(field.type)
                          ? { shrink: true }
                          : undefined
                      }
                      multiline={field.multiline}
                      minRows={field.rows}
                      placeholder={field.placeholder}
                      value={form[field.name] ?? ""}
                      onChange={(e) =>
                        setForm((v) => ({ ...v, [field.name]: e.target.value }))
                      }
                      required={field.required}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ p: 2.5, borderTop: "1px solid #E2E8F0" }}
          >
            <Button onClick={close} variant="outlined">
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving} variant="contained">
              {saving ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ModulePage;
