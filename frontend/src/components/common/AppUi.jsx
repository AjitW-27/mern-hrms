import React from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

export const AppButton = ({ sx, ...props }) => (
  <Button {...props} sx={{ minHeight: 40, borderRadius: 1.25, px: 2, ...sx }} />
);

export const AppInput = ({ sx, ...props }) => (
  <TextField fullWidth size="small" {...props} sx={{ "& .MuiOutlinedInput-root": { minHeight: 40 }, ...sx }} />
);

export const AppSelect = ({ label, helperText, error, options = [], sx, ...props }) => (
  <FormControl fullWidth size="small" error={error} sx={sx}>
    {label && <InputLabel>{label}</InputLabel>}
    <Select label={label} {...props}>
      {options.map((option) => (
        <MenuItem key={String(option.value ?? option)} value={option.value ?? option}>
          {option.label ?? option}
        </MenuItem>
      ))}
    </Select>
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

export const AppFormField = ({ label, required, helperText, error, children }) => (
  <Box>
    {label && (
      <Typography component="label" sx={{ display: "block", mb: 0.75, fontSize: 13, fontWeight: 600, color: "text.primary" }}>
        {label}{required && <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>}
      </Typography>
    )}
    {children}
    {(helperText || error) && <FormHelperText error={Boolean(error)}>{error || helperText}</FormHelperText>}
  </Box>
);

export const AppStatusBadge = ({ status }) => {
  const value = String(status || "Unknown");
  const tone = /active|approved|paid|completed|published/i.test(value)
    ? { bg: "#DCFCE7", color: "#15803D" }
    : /inactive|rejected|blocked|terminated/i.test(value)
      ? { bg: "#FEE2E2", color: "#B91C1C" }
      : /pending|notice|maintenance|planned|leave/i.test(value)
        ? { bg: "#FEF3C7", color: "#B45309" }
        : { bg: "#DBEAFE", color: "#1D4ED8" };
  return <Chip label={value} size="small" sx={{ height: 26, bgcolor: tone.bg, color: tone.color, borderRadius: 1, fontWeight: 700 }} />;
};
