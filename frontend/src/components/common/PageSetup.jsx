import React from "react";
import { Box } from "@mui/material";

const PageSetup = ({ children }) => (
  <Box
    sx={{
      width: "100%",
      maxWidth: "none",
      mx: 0,
      color: "text.primary",
      boxSizing: "border-box",
    }}
  >
    {children}
  </Box>
);

export default PageSetup;
