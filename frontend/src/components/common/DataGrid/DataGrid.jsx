import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import TableToolbar from "../TableToolbar";

const SHADOW_SM = "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)";
const SHADOW_MD =
  "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)";

const allowedStatus = new Set([
  "active",
  "inactive",
  "pending",
  "approved",
  "rejected",
  "paid",
  "completed",
  "in progress",
  "on leave",
  "assigned",
  "maintenance",
  "published",
  "unpublished",
  "draft",
  "planned",
  "delayed",
  "blocked",
]);

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const escapePdf = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const u16 = (n) => [n & 255, (n >>> 8) & 255];
const u32 = (n) => [
  n & 255,
  (n >>> 8) & 255,
  (n >>> 16) & 255,
  (n >>> 24) & 255,
];

const zipStore = (files) => {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data =
      typeof file.data === "string" ? encoder.encode(file.data) : file.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    let p = 0;
    local.set([80, 75, 3, 4], p);
    p += 4;
    local.set(u16(20), p);
    p += 2;
    local.set(u16(0), p);
    p += 2;
    local.set(u16(0), p);
    p += 2;
    local.set(u16(0), p);
    p += 2;
    local.set(u16(0), p);
    p += 2;
    local.set(u32(crc), p);
    p += 4;
    local.set(u32(data.length), p);
    p += 4;
    local.set(u32(data.length), p);
    p += 4;
    local.set(u16(name.length), p);
    p += 2;
    local.set(u16(0), p);
    p += 2;
    local.set(name, p);
    p += name.length;
    local.set(data, p);
    chunks.push(local);
    const c = new Uint8Array(46 + name.length);
    p = 0;
    c.set([80, 75, 1, 2], p);
    p += 4;
    c.set(u16(20), p);
    p += 2;
    c.set(u16(20), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u32(crc), p);
    p += 4;
    c.set(u32(data.length), p);
    p += 4;
    c.set(u32(data.length), p);
    p += 4;
    c.set(u16(name.length), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u16(0), p);
    p += 2;
    c.set(u32(0), p);
    p += 4;
    c.set(u32(offset), p);
    p += 4;
    c.set(name, p);
    central.push(c);
    offset += local.length;
  }
  const centralStart = offset;
  chunks.push(...central);
  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  let p = 0;
  end.set([80, 75, 5, 6], p);
  p += 4;
  end.set(u16(0), p);
  p += 2;
  end.set(u16(0), p);
  p += 2;
  end.set(u16(files.length), p);
  p += 2;
  end.set(u16(files.length), p);
  p += 2;
  end.set(u32(centralSize), p);
  p += 4;
  end.set(u32(centralStart), p);
  p += 4;
  end.set(u16(0), p);
  chunks.push(end);
  return new Blob(chunks, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const makeXlsx = (headers, rows) => {
  const cols = headers.map((_, i) => String.fromCharCode(65 + i));
  const rowXml = (row, rowNumber) =>
    `<row r="${rowNumber}">${row
      .map(
        (value, i) =>
          `<c r="${cols[i]}${rowNumber}" t="inlineStr"><is><t>${escapeXml(
            value,
          )}</t></is></c>`,
      )
      .join("")}</row>`;
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1">${headers
    .map(
      (h, i) =>
        `<c r="${cols[i]}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`,
    )
    .join("")}</row>${rows
    .map((r, i) => rowXml(r, i + 2))
    .join("")}</sheetData></worksheet>`;
  return zipStore([
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      data: `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="HRMS Export" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    },
    { name: "xl/worksheets/sheet1.xml", data: xml },
  ]);
};

const makePdf = (headers, rows) => {
  const lines = [headers.join(" | "), ...rows.map((row) => row.join(" | "))];
  const maxLines = 48;
  const pageLines = [];
  for (let i = 0; i < lines.length; i += maxLines)
    pageLines.push(lines.slice(i, i + maxLines));
  const objects = [];
  const pages = [];
  const add = (s) => {
    objects.push(s);
    return objects.length;
  };
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  pageLines.forEach((page) => {
    const stream = [
      "BT",
      "/F1 9 Tf",
      "40 760 Td",
      ...page.map(
        (line, idx) =>
          `${idx ? "0 -14 Td" : ""} (${escapePdf(line.slice(0, 160))}) Tj`,
      ),
      "ET",
    ].join("\n");
    const contentId = add(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    pages.push({ contentId });
  });
  const pagesId = objects.length + 1;
  const pageIds = pages.map(() => objects.length + 2);
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  add(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  pages.forEach((p) =>
    add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${p.contentId} 0 R >>`,
    ),
  );
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets[i + 1] = pdf.length;
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++)
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
};

const fileDate = () => new Date().toISOString().slice(0, 10);
const slug = (value) =>
  String(value || "export")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "export";
const display = (row, column) =>
  column?.valueGetter ? column.valueGetter(row) : row?.[column?.field];

const DataGrid = ({
  columns = [],
  rows = [],
  loading = false,
  error = "",
  actions,
  getRowId,
  emptyMessage = "No records found",
  emptyDescription = "Create a record or adjust your filters.",
  initialRowsPerPage = 25,
  minWidth = 720,
  bodyHeight = "calc(100vh - 310px)",
  searchPlaceholder = "Search",
  pageName = "records",
}) => {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const searchOk =
        !q ||
        columns.some((column) =>
          String(display(row, column) ?? "")
            .toLowerCase()
            .includes(q),
        );

      let filterOk = true;
      if (
        advancedFilter &&
        advancedFilter.field &&
        advancedFilter.value !== ""
      ) {
        const column = columns.find((c) => c.field === advancedFilter.field);
        const cellVal = String(display(row, column) ?? "").toLowerCase();
        const targetVal = String(advancedFilter.value).toLowerCase();

        switch (advancedFilter.operator) {
          case "equals":
            filterOk = cellVal === targetVal;
            break;
          case "notEquals":
            filterOk = cellVal !== targetVal;
            break;
          case "contains":
            filterOk = cellVal.includes(targetVal);
            break;
          case "notContains":
            filterOk = !cellVal.includes(targetVal);
            break;
          default:
            filterOk = true;
        }
      }

      return searchOk && filterOk;
    });
  }, [columns, query, rows, advancedFilter]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    if (!sortField) return data;
    const column = columns.find((c) => c.field === sortField);
    data.sort((a, b) =>
      String(display(a, column) ?? "").localeCompare(
        String(display(b, column) ?? ""),
        undefined,
        { numeric: true, sensitivity: "base" },
      ),
    );
    return sortDirection === "asc" ? data : data.reverse();
  }, [columns, filtered, sortDirection, sortField]);

  const visible = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  useEffect(() => {
    setPage((p) =>
      Math.min(p, Math.max(0, Math.ceil(sorted.length / rowsPerPage) - 1)),
    );
  }, [rowsPerPage, sorted.length]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const reset = () => {
    setQuery("");
    setAdvancedFilter(null);
    setSortField("");
    setSortDirection("asc");
    setPage(0);
  };

  const sort = () => {
    const nextField =
      sortField || columns.find((c) => c.sortable !== false)?.field || "";
    if (!nextField) return;
    if (sortField) setSortDirection((v) => (v === "asc" ? "desc" : "asc"));
    else {
      setSortField(nextField);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const exportData = async (kind) => {
    setExportAnchor(null);
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const headers = columns.map((c) => c.headerName);
    const dataRows = filtered.map((row) =>
      columns.map((c) => display(row, c) ?? ""),
    );
    const name = `${slug(pageName)}_${fileDate()}`;
    let blob;
    if (kind === "xlsx") blob = makeXlsx(headers, dataRows);
    else if (kind === "pdf") blob = makePdf(headers, dataRows);
    else
      blob = new Blob(
        [
          [headers, ...dataRows]
            .map((r) =>
              r
                .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                .join(","),
            )
            .join("\n"),
        ],
        { type: "text/csv;charset=utf-8" },
      );
    const ext = kind === "xlsx" ? "xlsx" : kind === "pdf" ? "pdf" : "csv";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    setToast("Export ready");
  };

  const renderCell = (row, column) => {
    const value = display(row, column);
    const text = value == null || value === "" ? "—" : value;
    if (column.renderCell) return column.renderCell(row);
    if (
      column.type === "status" ||
      column.field === "status" ||
      (typeof text === "string" && allowedStatus.has(text.toLowerCase()))
    )
      return (
        <Chip
          label={String(text)}
          size="small"
          sx={{
            height: 26,
            bgcolor:
              String(text).toLowerCase().includes("active") ||
              String(text).toLowerCase() === "approved" ||
              String(text).toLowerCase() === "published" ||
              String(text).toLowerCase() === "paid" ||
              String(text).toLowerCase() === "completed"
                ? "#DCFCE7"
                : String(text).toLowerCase().includes("pending") ||
                    String(text).toLowerCase().includes("maintenance") ||
                    String(text).toLowerCase().includes("planned")
                  ? "#FEF3C7"
                  : String(text).toLowerCase().includes("reject") ||
                      String(text).toLowerCase().includes("inactive") ||
                      String(text).toLowerCase().includes("blocked")
                    ? "#FEE2E2"
                    : "#E0F2FE",
            color:
              String(text).toLowerCase().includes("active") ||
              String(text).toLowerCase() === "approved" ||
              String(text).toLowerCase() === "published" ||
              String(text).toLowerCase() === "paid" ||
              String(text).toLowerCase() === "completed"
                ? "#10B981"
                : String(text).toLowerCase().includes("pending") ||
                    String(text).toLowerCase().includes("maintenance") ||
                    String(text).toLowerCase().includes("planned")
                  ? "#F59E0B"
                  : String(text).toLowerCase().includes("reject") ||
                      String(text).toLowerCase().includes("inactive") ||
                      String(text).toLowerCase().includes("blocked")
                    ? "#EF4444"
                    : "#0EA5E9",
          }}
        />
      );
    if (column.type === "money")
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
          ₹{Number(value || 0).toLocaleString("en-IN")}
        </Typography>
      );
    if (column.type === "date")
      return (
        <Typography sx={{ fontSize: 13, color: "#475569" }}>
          {value ? new Date(value).toLocaleDateString("en-IN") : "—"}
        </Typography>
      );
    return (
      <Typography
        sx={{
          fontSize: 13,
          lineHeight: "20px",
          fontWeight: column.bold ? 600 : 400,
          color: "#475569",
        }}
      >
        {String(text)}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid #E2E8F0",
        borderRadius: 1,
        bgcolor: "#FFFFFF",
        boxShadow: SHADOW_SM,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Replaced hardcoded toolbar with TableToolbar component */}
      <TableToolbar
        query={query}
        onQueryChange={(val) => {
          setQuery(val);
          setPage(0);
        }}
        placeholder={searchPlaceholder}
        sortActive={Boolean(sortField)}
        sortDirection={sortDirection}
        onSort={sort}
        onReset={reset}
        onExport={(e) => setExportAnchor(e.currentTarget)}
        columns={columns}
        filterValue={advancedFilter}
        onFilterApply={(f) => {
          setAdvancedFilter(f);
          setPage(0);
        }}
        onFilterClear={() => {
          setAdvancedFilter(null);
          setPage(0);
        }}
      />

      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem onClick={() => exportData("xlsx")}>
          Excel (.xlsx) — Recommended
        </MenuItem>
        <MenuItem onClick={() => exportData("csv")}>
          CSV (.csv) — Raw data
        </MenuItem>
        <MenuItem onClick={() => exportData("pdf")}>
          PDF (.pdf) — Print ready
        </MenuItem>
      </Menu>

      {/* Table Container with scrolling isolated to body */}
      <TableContainer
        sx={{
          maxHeight: bodyHeight,
          overflowY: "auto",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CBD5E1",
            borderRadius: "4px",
          },
        }}
      >
        <Table
          stickyHeader
          sx={{ minWidth, borderCollapse: "separate", borderSpacing: 0 }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    height: 44,
                    px: 2,
                    py: 0,
                    bgcolor: "#F8FAFC",
                    color: "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  sx={{
                    height: 44,
                    px: 2,
                    bgcolor: "#F8FAFC",
                    color: "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  sx={{ p: 0 }}
                >
                  <LinearProgress sx={{ height: 3 }} />
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  sx={{ py: 6, textAlign: "center", color: "#EF4444" }}
                >
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              !error &&
              visible.map((row, index) => (
                <TableRow
                  key={getRowId?.(row) ?? row?._id ?? row?.id ?? index}
                  hover
                  sx={{ height: 52, "&:hover td": { bgcolor: "#F8FAFC" } }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      sx={{
                        height: 52,
                        px: 2,
                        py: 1,
                        borderBottom: "1px solid #F1F5F9",
                      }}
                    >
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell
                      sx={{
                        height: 52,
                        px: 1.5,
                        borderBottom: "1px solid #F1F5F9",
                      }}
                    >
                      <Stack direction="row" spacing={0.5}>
                        {actions(row)}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {!loading && !error && visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  sx={{ borderBottom: 0 }}
                >
                  <Box sx={{ py: 10, textAlign: "center" }}>
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}
                    >
                      {query || advancedFilter
                        ? "No matching records"
                        : emptyMessage}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "none" }}>
                      {emptyDescription}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer aligned cleanly on the right */}
      <Box
        sx={{
          borderTop: "1px solid #E2E8F0",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 2,
          bgcolor: "#FFFFFF",
        }}
      >
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{
            border: "none",
            "& .MuiTablePagination-toolbar": { minHeight: 56, p: 0 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              { fontSize: 12, color: "#475569" },
          }}
        />
      </Box>

      {/* Toast Notification */}
      {toast && (
        <Box
          role="status"
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1600,
            px: 2,
            py: 1.25,
            borderRadius: 1,
            bgcolor: "#0F172A",
            color: "#FFFFFF",
            boxShadow: SHADOW_MD,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toast}
        </Box>
      )}
    </Box>
  );
};

export default DataGrid;
