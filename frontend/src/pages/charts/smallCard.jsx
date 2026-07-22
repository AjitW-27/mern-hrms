import { Card, CardContent, Typography, Box } from "@mui/material";

const KpiCard = ({ title, value, change, icon, color }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        minHeight: 130,
        display: "flex",
        alignItems: "center",

        background:
          "linear-gradient(135deg, rgba(30,41,59,0.6), rgba(15,23,42,0.9))",

        backdropFilter: "blur(100px)",

        border: "1px solid rgba(255,255,255,0.08)",

        boxShadow:
          "0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",

        color: "#fff",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 1px 10px rgba(59,130,246,0.25)",
        },
      }}
    >
      <CardContent sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* LEFT */}
          <Box>
            <Typography fontSize={14} color="#94a3b8">
              {title || "--"}
            </Typography>

            <Typography variant="h5" fontWeight="bold" mt={1}>
              {value ?? "0"}
            </Typography>

            <Typography
              fontSize={13}
              mt={1}
              color={
                change?.includes("+")
                  ? "#22c55e"
                  : change?.includes("-")
                    ? "#ef4444"
                    : "#9ca3af"
              }
            >
              {change ? `${change} from last month` : "No data"}
            </Typography>
          </Box>

          {/* RIGHT ICON */}
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: 2,
              background: color,
              boxShadow: "inset 0 0 5px rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
