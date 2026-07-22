const Organization = require("../models/organizationModel");
const asyncHandler = require("../utils/asyncHandler");

const listOrganizations = asyncHandler(async (req, res) => {
  const data = await Organization.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});

const createOrganization = asyncHandler(async (req, res) => {
  const data = await Organization.create(req.body);
  res.status(201).json({ success: true, message: "Organization created", data });
});

const getOrganization = asyncHandler(async (req, res) => {
  const data = await Organization.findById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Organization not found" });
  res.json({ success: true, data });
});

const updateOrganization = asyncHandler(async (req, res) => {
  const data = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!data) return res.status(404).json({ success: false, message: "Organization not found" });
  res.json({ success: true, message: "Organization updated", data });
});

const deleteOrganization = asyncHandler(async (req, res) => {
  const data = await Organization.findByIdAndDelete(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Organization not found" });
  res.json({ success: true, message: "Organization deleted" });
});

module.exports = {
  listOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization
};
