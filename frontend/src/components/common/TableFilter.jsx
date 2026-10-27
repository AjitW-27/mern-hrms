import { Button, IconButton, Input as TextField } from "./UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Divider, MenuItem, Popover, Stack, Typography } from "@mui/material";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Does not contain" },
];

const getType = (column) => {
  if (column?.filterType) return column.filterType;
  if (column?.type === "date") return "date";
  if (["number", "money", "progress"].includes(column?.type)) return "number";
  return "text";
};

const TableFilter = ({ columns = [], value, onApply, onClear }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [field, setField] = useState(value?.field || columns[0]?.field || "");
  const [operator, setOperator] = useState(value?.operator || "contains");
  const [filterValue, setFilterValue] = useState(value?.value ?? "");

  useEffect(() => {
    setField(value?.field || columns[0]?.field || "");
    setOperator(value?.operator || "contains");
    setFilterValue(value?.value ?? "");
  }, [value, columns]);

  const selectedColumn = useMemo(
    () => columns.find((column) => column.field === field) || columns[0],
    [columns, field],
  );
  const inputType = getType(selectedColumn);
  const active = Boolean(
    value?.field &&
    value?.value !== "" &&
    value?.value !== null &&
    value?.value !== undefined,
  );

  const apply = () => {
    if (!field || filterValue === "") {
      onClear?.();
      setAnchorEl(null);
      return;
    }
    onApply?.({ field, operator, value: filterValue, type: inputType });
    setAnchorEl(null);
  };

  const clear = () => {
    setFilterValue("");
    onClear?.();
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<FilterListRoundedIcon fontSize="small" />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          minHeight: 40,
          borderRadius: "4px",
          borderColor: active ? themeColors.warning : "divider",
          color: active ? themeColors.warning : "text.primary",
          px: 1.5,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        Filter{active ? " (1)" : ""}
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: { xs: "calc(100vw - 24px)", sm: 720 },
            maxWidth: "calc(100vw - 24px)",
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "4px",
            boxShadow:
              "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1.5}
          >
            <Box>
              <Typography
                sx={{ fontSize: 15, fontWeight: 600, color: "text.primary" }}
              >
                Filter records
              </Typography>
              <Typography
                sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}
              >
                Field → Condition → Value
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setAnchorEl(null)}
              aria-label="Close filter"
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {/* Always forced into 3 side-by-side columns */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.2fr",
              gap: 1.5,
              alignItems: "start",
            }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Field"
              value={field}
              onChange={(event) => {
                setField(event.target.value);
                setFilterValue("");
              }}
            >
              {columns.map((column) => (
                <MenuItem key={column.field} value={column.field}>
                  {column.headerName || column.field}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Condition"
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
            >
              {OPERATORS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Value"
              type={inputType}
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
              placeholder={inputType === "text" ? "Enter a value" : undefined}
              InputLabelProps={
                inputType === "date" ? { shrink: true } : undefined
              }
              inputProps={inputType === "number" ? { step: "any" } : undefined}
            />
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button
              size="small"
              onClick={clear}
              sx={{ minHeight: 36, borderRadius: "4px", fontWeight: 600 }}
            >
              Reset
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={apply}
              sx={{ minHeight: 36, borderRadius: "4px", fontWeight: 600 }}
            >
              Apply Filter
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default TableFilter;
