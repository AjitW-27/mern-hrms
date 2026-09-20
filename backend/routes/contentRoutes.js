const express = require("express");
const { protect, permit, getUserRoleCode } = require("../middleware/authMiddleware");
const content = require("../controllers/contentController");
const router = express.Router();
const adminOnly = (req, res, next) => {
  const role = getUserRoleCode(req.user);
  return ["admin", "superadmin", "super_admin"].includes(role) ? next() : res.status(403).json({ success: false, message: "Administrator access is required." });
};
router.use(protect, adminOnly);
router.route("/announcements").get(permit("announcements", "read"), content.listAnnouncements).post(permit("announcements", "create"), content.createAnnouncement);
router.route("/announcements/:id").put(permit("announcements", "update"), content.updateAnnouncement).delete(permit("announcements", "delete"), content.deleteAnnouncement);
router.route("/holidays").get(permit("holidays", "read"), content.listHolidays).post(permit("holidays", "create"), content.createHoliday);
router.route("/holidays/:id").put(permit("holidays", "update"), content.updateHoliday).delete(permit("holidays", "delete"), content.deleteHoliday);
module.exports = router;
