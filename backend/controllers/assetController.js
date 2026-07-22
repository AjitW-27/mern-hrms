const Asset = require("../models/assetModel");

// 1. Add New Asset (Admin/HR Only)
const addAsset = async (req, res) => {
    try {
        const { assetName, assetId, type } = req.body;

        if (!assetName || !assetId || !type) {
            return res.status(400).json({ message: "Asset Name, ID, and Type are required" });
        }

        const newAsset = new Asset({
            assetName,
            assetId,
            type,
            status: "Available"
        });

        await newAsset.save();
        res.status(201).json({ message: "Asset added successfully", data: newAsset });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Asset ID must be unique" });
        }
        res.status(500).json({ message: "Error adding asset", error: error.message });
    }
};

// 2. Get All Assets (Admin/HR Only)
const getAssets = async (req, res) => {
    try {
        // Populate uses employeeId to show which employee holds this asset
        const assets = await Asset.find().populate("assignedTo", "fullName email department");
        res.status(200).json(assets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching assets", error: error.message });
    }
};

// 3. Assign / Return Asset
const assignAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeId, status } = req.body; // status can be "Assigned" or "Available" (for return)

        const asset = await Asset.findById(id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        if (status === "Assigned") {
            if (!employeeId) return res.status(400).json({ message: "Employee ID is required to assign" });
            asset.assignedTo = employeeId;
            asset.status = "Assigned";
            asset.assignedDate = new Date();
            asset.returnDate = null;
        } else if (status === "Available") {
            // Employee returns the asset
            asset.assignedTo = null;
            asset.status = "Available";
            asset.returnDate = new Date();
        } else {
            return res.status(400).json({ message: "Invalid status update" });
        }

        await asset.save();
        res.status(200).json({ message: `Asset ${status} successfully`, data: asset });
    } catch (error) {
        res.status(500).json({ message: "Error updating asset", error: error.message });
    }
};

const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
        res.json({ success: true, message: "Asset updated", data: asset });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating asset", error: error.message });
    }
};

const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);
        if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
        res.json({ success: true, message: "Asset deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting asset", error: error.message });
    }
};

module.exports = { addAsset, getAssets, assignAsset, updateAsset, deleteAsset };
