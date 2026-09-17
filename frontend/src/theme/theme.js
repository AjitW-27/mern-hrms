import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#86e7ea",
        },
        background: {
            default: "#ffffff",
            paper: "#ffffff",
        },
    },
    typography: {
        fontFamily: "Poppins, sans-serif",
    },
});

export default theme;
