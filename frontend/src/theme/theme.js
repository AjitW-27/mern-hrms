import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#8b5cf6",
        },
        background: {
            default: "#0f172a",
            paper: "#1e293b",
        },
    },
    typography: {
        fontFamily: "Poppins, sans-serif",
    },
});

export default theme;