const Model = require("../models/trainingModel");
const asyncHandler = require("../utils/asyncHandler");
const { listFactory, createFactory, updateFactory, deleteFactory } = require("./crudFactory");

const getAll = listFactory(Model, { populate: [] });
const createOne = createFactory(Model, { label: "Training" });
const updateOne = updateFactory(Model, { label: "Training" });
const deleteOne = deleteFactory(Model, { label: "Training" });

module.exports = { getAll, createOne, updateOne, deleteOne };
