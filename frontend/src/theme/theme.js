import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#55C0C9",
        },
        background: {
            default: "#FFFFFF",
            paper: "#FFFFFF",
        },
    },
    typography: {
        fontFamily: "Poppins, sans-serif",
    },
});

export default theme;
