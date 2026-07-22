const asyncHandler = require("../utils/asyncHandler");

const listFactory = (Model, options = {}) =>
  asyncHandler(async (req, res) => {
    const query = {};
    if (options.query) Object.assign(query, options.query(req));
    const items = await Model.find(query).sort(options.sort || { createdAt: -1 }).populate(options.populate || []);
    res.json({ success: true, data: items });
  });

const createFactory = (Model, options = {}) =>
  asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    const created = options.populate ? await item.populate(options.populate) : item;
    res.status(201).json({ success: true, data: created, message: `${options.label || Model.modelName} created` });
  });

const updateFactory = (Model, options = {}) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: `${options.label || Model.modelName} not found` });
    Object.assign(item, req.body);
    await item.save();
    const updated = options.populate ? await item.populate(options.populate) : item;
    res.json({ success: true, data: updated, message: `${options.label || Model.modelName} updated` });
  });

const deleteFactory = (Model, options = {}) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: `${options.label || Model.modelName} not found` });
    res.json({ success: true, message: `${options.label || Model.modelName} deleted` });
  });

module.exports = { listFactory, createFactory, updateFactory, deleteFactory };
