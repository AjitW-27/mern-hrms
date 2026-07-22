const Model = require("../models/goalModel");
const asyncHandler = require("../utils/asyncHandler");
const { listFactory, createFactory, updateFactory, deleteFactory } = require("./crudFactory");

const getAll = listFactory(Model, { populate: ["employee"] });
const createOne = createFactory(Model, { label: "Goal" });
const updateOne = updateFactory(Model, { label: "Goal" });
const deleteOne = deleteFactory(Model, { label: "Goal" });

module.exports = { getAll, createOne, updateOne, deleteOne };
