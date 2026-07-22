const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.errors.map((item) => ({
        path: item.path.join("."),
        message: item.message
      }))
    });
  }

  req.body = result.data.body || req.body;
  req.query = result.data.query || req.query;
  req.params = result.data.params || req.params;
  next();
};

const commonSchemas = {
  mongoIdParam: z.object({
    params: z.object({ id: z.string().min(12) })
  }),
  pagination: z.object({
    query: z.object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      search: z.string().optional()
    }).passthrough()
  })
};

module.exports = { validate, commonSchemas, z };
