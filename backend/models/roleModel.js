const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    manage: { type: Boolean, default: false }
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    permissions: { type: Map, of: permissionSchema, default: {} },
    isSystemRole: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    level: { type: Number, default: 100 },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, versionKey: false }
);

roleSchema.pre("validate", function (next) {
  if (this.name) this.name = String(this.name).trim().toLowerCase();
  if (!this.code && this.name) this.code = this.name.replace(/\s+/g, "_");
  if (this.code) this.code = String(this.code).trim().toLowerCase().replace(/\s+/g, "_");
  next();
});

roleSchema.methods.toJSON = function () {
  const obj = this.toObject({ flattenMaps: true });
  return obj;
};

module.exports = mongoose.models.Role || mongoose.model("Role", roleSchema);
