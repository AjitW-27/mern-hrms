import React from "react";
import {
  Box,
  Card,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";

export const CommonDataTable = ({
  columns = [],
  rows = [],
  config = {},
  searchValue = "",
  onSearchChange = () => {},
  page = 0,
  rowsPerPage = 25,
  totalCount = 0,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  actions,
  addBtn,
  onAddClick,
}) => {
  // Determine Add button label from props or config
  const rawAddBtn = addBtn || config?.addBtn;
  const rawOnAddClick = onAddClick || config?.onAddClick;

  const formatAddBtnLabel = (label) => {
    if (!label) return "";
    const lower = label.toLowerCase();
    if (lower === "addproject") return "Add Project";
    if (lower === "addattendance") return "Add Attendance";
    return label.replace(/([A-Z])/g, " $1").trim();
  };

  // Helper function to safely render cell content
  const renderCellContent = (row, col) => {
    // 1. If column has a custom renderCell
    if (typeof col.renderCell === "function") {
      return col.renderCell(row);
    }

    // 2. If column has a valueGetter
    if (typeof col.valueGetter === "function") {
      return col.valueGetter(row);
    }

    // 3. Fallback to col.field or col.id
    const fieldKey = col.field || col.id;
    let val = row?.[fieldKey];

    // Special fallback for employee name if populated as an object
    if (fieldKey === "employeeName" && !val) {
      val =
        row?.employeeId?.fullName ||
        row?.employee?.fullName ||
        row?.employeeId?.name ||
        row?.employee?.name ||
        (typeof row?.employeeId === "string" ? row.employeeId : "—");
    }

    // If date format is ISO string, format to YYYY-MM-DD
    if (
      fieldKey === "date" &&
      val &&
      typeof val === "string" &&
      val.includes("T")
    ) {
      val = new Date(val).toLocaleDateString("en-CA"); // YYYY-MM-DD
    }

    // If value is an object, try to print its readable name
    if (typeof val === "object" && val !== null) {
      return val.fullName || val.name || val.title || JSON.stringify(val);
    }

    return val !== undefined && val !== null && String(val).trim() !== ""
      ? String(val)
      : "—";
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 125px)",
        minHeight: 500,
        width: "100%",
        pb: 1.5,
      }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          boxShadow: "none",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            p: 2,
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search records..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 260, md: 320 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": { borderColor: "#CBD5E1" },
                "&:hover fieldset": { borderColor: "#FD5622" },
                "&.Mui-focused fieldset": { borderColor: "#FD5622" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              sx={{ border: "1px solid #E2E8F0", borderRadius: "8px", p: 1 }}
            >
              <ViewColumnIcon sx={{ fontSize: 18, color: "#64748B" }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={config?.onRefreshClick}
              sx={{ border: "1px solid #E2E8F0", borderRadius: "8px", p: 1 }}
            >
              <RefreshIcon sx={{ fontSize: 18, color: "#64748B" }} />
            </IconButton>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
              onClick={config?.onFilterClick}
              sx={{
                textTransform: "none",
                borderColor: "#E2E8F0",
                color: "#475569",
                borderRadius: "8px",
                height: 38,
                "&:hover": {
                  borderColor: "#CBD5E1",
                  backgroundColor: "#F8FAFC",
                },
              }}
            >
              Filter
            </Button>

            {/* Export Icon */}
            <IconButton
              size="small"
              onClick={config?.onExportClick}
              sx={{
                border: "1px solid #006666",
                borderRadius: "8px",
                p: 1,
                color: "#006666",
                backgroundColor: "#F0FDFA",
                "&:hover": { backgroundColor: "#CCFBF1" },
              }}
            >
              <FileDownloadOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Common Add Button right of Export */}
            {rawAddBtn && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={rawOnAddClick}
                sx={{
                  backgroundColor: "#FD5622",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  height: 38,
                  px: 2,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#E04818", boxShadow: "none" },
                }}
              >
                {formatAddBtnLabel(rawAddBtn)}
              </Button>
            )}
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer
          sx={{
            flex: 1,
            height: "100%",
            overflowY: "auto",
            overflowX: "auto",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            "&::-webkit-scrollbar": { width: "6px", height: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#CBD5E1",
              borderRadius: "4px",
            },
          }}
        >
          <Table
            stickyHeader
            sx={{ minWidth: 650, height: rows.length === 0 ? "100%" : "auto" }}
          >
            <TableHead>
              <TableRow>
                {columns.map((col, cIdx) => (
                  <TableCell
                    // FIX: Unique key using col.field or col.id
                    key={col.field || col.id || `col-${cIdx}`}
                    align={col.align || "left"}
                    sx={{
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      py: 1.5,
                      borderTop: 0,
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    {col.headerName || col.label}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      py: 1.5,
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody sx={{ height: rows.length === 0 ? "100%" : "auto" }}>
              {rows.length > 0 ? (
                rows.map((row, rIdx) => (
                  <TableRow
                    // FIX: Unique row key using _id or id or index
                    key={row._id || row.id || `row-${rIdx}`}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {columns.map((col, cIdx) => (
                      <TableCell
                        // FIX: Unique cell key using col.field or col.id
                        key={`${row._id || rIdx}-${col.field || col.id || cIdx}`}
                        align={col.align || "left"}
                        sx={{ py: 1.5, fontSize: "0.875rem" }}
                      >
                        {/* FIX: Now correctly renders field valueGetter, renderCell, or field */}
                        {renderCellContent(row, col)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow sx={{ height: "100%" }}>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    sx={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      border: 0,
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        my: "auto",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "#1E293B", mb: 0.5 }}
                      >
                        No records found
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>
                        Create a record or adjust your filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Pagination */}
        <Box sx={{ borderTop: "1px solid #E2E8F0" }}>
          <TablePagination
            component="div"
            count={totalCount || rows.length}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default CommonDataTable;
