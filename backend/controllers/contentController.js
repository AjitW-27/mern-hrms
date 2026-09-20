const { Announcement, Holiday } = require("../models/otherModel");
const asyncHandler = require("../utils/asyncHandler");

const dateValue = (value) => (value ? new Date(value) : null);
const validateAnnouncement = (body) => {
  if (!String(body.title || "").trim() || !String(body.message || "").trim()) return "Title and content are required.";
  const publishDate = dateValue(body.publishDate);
  const expiryDate = dateValue(body.expiryDate);
  if (body.publishDate && Number.isNaN(publishDate?.getTime())) return "Publish date is invalid.";
  if (body.expiryDate && Number.isNaN(expiryDate?.getTime())) return "Expiry date is invalid.";
  if (publishDate && expiryDate && expiryDate < publishDate) return "Expiry date cannot be before publish date.";
  return null;
};
const validateHoliday = (body) => {
  const date = dateValue(body.date);
  if (!String(body.name || "").trim()) return "Holiday name is required.";
  if (!body.date || Number.isNaN(date?.getTime())) return "A valid holiday date is required.";
  return null;
};

exports.listAnnouncements = asyncHandler(async (_req, res) => {
  const data = await Announcement.find().populate("postedBy", "name").sort({ publishDate: -1, createdAt: -1 }).lean();
  res.json({ success: true, data });
});
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const error = validateAnnouncement(req.body); if (error) return res.status(400).json({ success: false, message: error });
  const data = await Announcement.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, data });
});
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const current = await Announcement.findById(req.params.id); if (!current) return res.status(404).json({ success: false, message: "Announcement not found." });
  const next = { ...current.toObject(), ...req.body }; const error = validateAnnouncement(next); if (error) return res.status(400).json({ success: false, message: error });
  Object.assign(current, req.body); await current.save(); res.json({ success: true, data: current });
});
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const data = await Announcement.findByIdAndDelete(req.params.id); if (!data) return res.status(404).json({ success: false, message: "Announcement not found." });
  res.json({ success: true, message: "Announcement deleted." });
});
exports.listHolidays = asyncHandler(async (_req, res) => {
  const data = await Holiday.find().sort({ date: 1 }).lean(); res.json({ success: true, data });
});
exports.createHoliday = asyncHandler(async (req, res) => {
  const error = validateHoliday(req.body); if (error) return res.status(400).json({ success: false, message: error });
  const date = dateValue(req.body.date); const data = await Holiday.create({ ...req.body, date, year: date.getFullYear() });
  res.status(201).json({ success: true, data });
});
exports.updateHoliday = asyncHandler(async (req, res) => {
  const current = await Holiday.findById(req.params.id); if (!current) return res.status(404).json({ success: false, message: "Holiday not found." });
  const next = { ...current.toObject(), ...req.body }; const error = validateHoliday(next); if (error) return res.status(400).json({ success: false, message: error });
  const date = dateValue(next.date); Object.assign(current, req.body, { date, year: date.getFullYear() }); await current.save(); res.json({ success: true, data: current });
});
exports.deleteHoliday = asyncHandler(async (req, res) => {
  const data = await Holiday.findByIdAndDelete(req.params.id); if (!data) return res.status(404).json({ success: false, message: "Holiday not found." });
  res.json({ success: true, message: "Holiday deleted." });
});
