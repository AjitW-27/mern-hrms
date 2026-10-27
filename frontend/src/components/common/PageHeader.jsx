import React from "react";
import { Stack } from "@mui/material";
import { Button } from "./UI";
// Compatibility adapter: route metadata is rendered exclusively by AppHeader.
export default function PageHeader({ actionLabel, onAction, actionIcon: Icon }) { return actionLabel && onAction ? <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}><Button variant="primary" onClick={onAction} startIcon={Icon ? <Icon /> : undefined}>{actionLabel}</Button></Stack> : null; }
