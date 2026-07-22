const Model = require("../models/performanceModel");
const asyncHandler = require("../utils/asyncHandler");
const { listFactory, createFactory, updateFactory, deleteFactory } = require("./crudFactory");

const getAll = listFactory(Model, { populate: ["employee"] });
const createOne = createFactory(Model, { label: "Performance" });
const updateOne = updateFactory(Model, { label: "Performance" });
const deleteOne = deleteFactory(Model, { label: "Performance" });

module.exports = { getAll, createOne, updateOne, deleteOne };
