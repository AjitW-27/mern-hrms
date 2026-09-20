const Onboarding = require("../models/onboardingModel");
const asyncHandler = require("../utils/asyncHandler");
const getAll = asyncHandler(async (_req, res) => res.json({ success: true, data: await Onboarding.find().populate("employee").sort({ createdAt: -1 }).lean() }));
const createOne = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await Onboarding.create(req.body) }));
const updateOne = asyncHandler(async (req, res) => { const item = await Onboarding.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true }); if (!item) return res.status(404).json({ success:false, message:"Onboarding record not found." }); res.json({ success:true, data:item }); });
const deleteOne = asyncHandler(async (req, res) => { const item = await Onboarding.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ success:false, message:"Onboarding record not found." }); res.json({ success:true, message:"Onboarding record deleted." }); });
module.exports = { getAll, createOne, updateOne, deleteOne };
