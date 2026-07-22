const Model = require("../models/onboardingModel");
const asyncHandler = require("../utils/asyncHandler");
const { listFactory, createFactory, updateFactory, deleteFactory } = require("./crudFactory");

const getAll = listFactory(Model, { populate: ["employee"] });
const createOne = createFactory(Model, { label: "Onboarding" });
const updateOne = updateFactory(Model, { label: "Onboarding" });
const deleteOne = deleteFactory(Model, { label: "Onboarding" });

module.exports = { getAll, createOne, updateOne, deleteOne };
