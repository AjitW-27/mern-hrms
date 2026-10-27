// Repair only missing role records. Existing accounts, roles and permissions are preserved.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { ensureDefaultRoles } = require("../utils/bootstrap");
(async () => {
  try { await mongoose.connect(process.env.MONGO_URI); await ensureDefaultRoles(); console.log("Missing default role records repaired; existing roles and permissions preserved."); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
