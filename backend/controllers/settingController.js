const Settings = require("../models/settingModel");
const { clearRbacCache } = require("../middleware/authMiddleware");

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ rbacEnabled: false, rbacModeInitialized: true });
    } else if (settings.rbacModeInitialized !== true) {
      // Existing installations created before the RBAC switch existed start
      // with access control disabled once, so all authenticated modules remain
      // visible. After this migration, the administrator's choice is preserved.
      settings.rbacEnabled = false;
      settings.rbacModeInitialized = true;
      await settings.save();
    }
    const role = String(req.user?.role || "").toLowerCase();
    const isAdmin = ["superadmin", "admin", "hr"].includes(role);
    const data = isAdmin ? settings : { rbacEnabled: settings.rbacEnabled !== false };
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const patch = {};
    ["companyName", "supportEmail", "emailNotifications", "payrollAlerts", "rbacEnabled"].forEach((key) => {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    });
    const settings = await Settings.findOneAndUpdate({}, patch, { new: true, upsert: true, setDefaultsOnInsert: true });
    if (patch.rbacEnabled !== undefined) clearRbacCache();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

module.exports = { getSettings, updateSettings };
