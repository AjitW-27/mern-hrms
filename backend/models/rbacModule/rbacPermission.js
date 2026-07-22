const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        module: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        action: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            enum: [
                "create",
                "read",
                "update",
                "delete",
                "approve",
                "export",
                "manage",
            ],
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        isSystemPermission: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

permissionSchema.index(
    {
        module: 1,
        action: 1,
    },
    {
        unique: true,
    }
);

permissionSchema.pre("validate", function (next) {
    this.code = `${this.module}:${this.action}`;
    next();
});

module.exports = mongoose.model(
    "Permission",
    permissionSchema
);