import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createApplicationTheme } from "./theme/applicationTheme";
import useThemeStore from "./strore/themeStore";

const AppThemeProvider = ({ children }) => {
  const tokens = useThemeStore((state) => state.tokens);
  const theme = useMemo(() => createApplicationTheme(tokens), [tokens]);
  return <ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider>;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppThemeProvider>,
);
