import { IconButton } from "./UI";
import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Box, InputAdornment, OutlinedInput, Stack, Tooltip } from "@mui/material";
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
  actions,
}) => (
  <Box
    sx={{
      p: "12px 16px",
      bgcolor: themeColors.cardBg,
      borderRadius: "4px",
      boxShadow: "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
    }}
  >
    <Stack
      direction={{ xs: "column", md: "row" }}
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
            <SearchRoundedIcon sx={{ fontSize: 20, color: themeColors.textMuted }} />
          </InputAdornment>
        }
        sx={{
          width: { xs: "100%", md: 340 },
          height: 40,
          borderRadius: "4px",
          fontSize: 14,
        }}
      />
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
        {/* Sort Button with explicit Up/Down arrows */}
        <Tooltip title="Sort">
          <IconButton
            aria-label="Sort"
            onClick={onSort}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid " + themeColors.border,
              borderRadius: "4px",
              bgcolor: sortActive ? themeColors.primarySoft : themeColors.cardBg,
              color: sortActive ? themeColors.secondaryDark : themeColors.textMuted,
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
                  borderRadius: "4px",
                  bgcolor: themeColors.primary,
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
              border: "1px solid " + themeColors.border,
              borderRadius: "4px",
              color: themeColors.textMuted,
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
              borderRadius: "4px",
              color: themeColors.cardBg,
              background: "linear-gradient(135deg," + themeColors.primary + "," + themeColors.primary + ")",
            }}
          >
            <DownloadOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        {actions}
      </Stack>
    </Stack>
  </Box>
);

export default TableToolbar;
