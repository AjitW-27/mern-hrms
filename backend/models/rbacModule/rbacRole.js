const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },

        description: {
            type: String,
            default: "",
        },

        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],

        isSystemRole: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        level: {
            type: Number,
            default: 100,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

roleSchema.index({
    code: 1,
});

module.exports = mongoose.model(
    "Role",
    roleSchema
);