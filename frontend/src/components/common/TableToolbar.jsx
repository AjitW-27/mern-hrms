import React from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import TableFilter from "./TableFilter"; // Adjust the path if needed

const TableToolbar = ({
  query,
  onQueryChange,
  placeholder = "Search",
  sortActive = false,
  sortDirection = "asc",
  onSort,
  onReset,
  onExport,
  // Props specific to TableFilter
  columns = [],
  filterValue,
  onFilterApply,
  onFilterClear,
}) => (
  <Box
    sx={{
      p: "12px 16px",
      bgcolor: "#FFFFFF",
      borderRadius: 1,
      boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1.5}
    >
      <OutlinedInput
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        startAdornment={
          <InputAdornment position="start">
            <SearchRoundedIcon sx={{ fontSize: 20, color: "#64748B" }} />
          </InputAdornment>
        }
        sx={{
          width: { xs: "100%", md: 340 },
          height: 40,
          borderRadius: 1,
          fontSize: 14,
        }}
      />
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Sort Button with explicit Up/Down arrows */}
        <Tooltip title="Sort">
          <IconButton
            aria-label="Sort"
            onClick={onSort}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid #CBD5E1",
              borderRadius: 1,
              bgcolor: sortActive ? "#E6F7F8" : "#FFFFFF",
              color: sortActive ? "#0A5C67" : "#475569",
              position: "relative",
            }}
          >
            {sortActive ? (
              sortDirection === "desc" ? (
                <ArrowDownwardRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <ArrowUpwardRoundedIcon sx={{ fontSize: 20 }} />
              )
            ) : (
              <SortRoundedIcon sx={{ fontSize: 20 }} />
            )}
            {sortActive && (
              <Box
                sx={{
                  position: "absolute",
                  width: 7,
                  height: 7,
                  borderRadius: 1,
                  bgcolor: "#0E8F9A",
                  top: 5,
                  right: 5,
                }}
              />
            )}
          </IconButton>
        </Tooltip>

        {/* Reset Button */}
        <Tooltip title="Reset">
          <IconButton
            aria-label="Reset"
            onClick={onReset}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid #CBD5E1",
              borderRadius: 1,
              color: "#475569",
            }}
          >
            <RefreshRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* Integrated TableFilter Component */}
        <TableFilter
          columns={columns}
          value={filterValue}
          onApply={onFilterApply}
          onClear={onFilterClear}
        />

        {/* Export Button */}
        <Tooltip title="Export">
          <IconButton
            aria-label="Export"
            onClick={onExport}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              color: "#FFFFFF",
              background: "linear-gradient(135deg,#0E8F9A,#0B7480)",
            }}
          >
            <DownloadOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  </Box>
);

export default TableToolbar;
