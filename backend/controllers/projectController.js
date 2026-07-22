const Project = require("../models/projectModel");
const asyncHandler = require("../utils/asyncHandler");

const addProject = asyncHandler(async (req, res) => {
    let progress = req.body.progress;

    if (progress === undefined || progress === null || progress === "") {
        if (req.body.status === "Not Started") progress = 0;
        else if (req.body.status === "In Progress") progress = 50;
        else if (req.body.status === "Completed") progress = 100;
        else progress = 0;
    }

    const newProject = new Project({
        ...req.body,
        progress: Number(progress),
    });

    await newProject.save();
    res.status(201).json({ success: true, data: newProject });
});

const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find()
        .populate("projectManager", "name email profileImage")
        .populate("teamMembers", "name email profileImage")
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: projects });
});

const getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id)
        .populate("projectManager", "name email")
        .populate("teamMembers", "name email");

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
});

const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.status === "Completed" && (!updateData.progress || updateData.progress < 100)) {
        updateData.progress = 100;
        updateData.completedDate = new Date();
    }

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    )
    .populate("projectManager", "name email profileImage")
    .populate("teamMembers", "name email profileImage");

    if (!updatedProject) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: updatedProject });
});

const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
});

module.exports = {
    addProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getAll: getProjects,
    createOne: addProject,
    updateOne: updateProject,
    deleteOne: deleteProject
};
