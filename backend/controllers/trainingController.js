const Training = require("../models/trainingModel");
const asyncHandler = require("../utils/asyncHandler");
const getAll = asyncHandler(async (_req, res) => res.json({ success:true, data: await Training.find().sort({ createdAt:-1 }).lean() }));
const createOne = asyncHandler(async (req, res) => res.status(201).json({ success:true, data: await Training.create(req.body) }));
const updateOne = asyncHandler(async (req, res) => { const item = await Training.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true }); if (!item) return res.status(404).json({ success:false, message:"Training record not found." }); res.json({ success:true, data:item }); });
const deleteOne = asyncHandler(async (req, res) => { const item = await Training.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ success:false, message:"Training record not found." }); res.json({ success:true, message:"Training record deleted." }); });
module.exports = { getAll, createOne, updateOne, deleteOne };
