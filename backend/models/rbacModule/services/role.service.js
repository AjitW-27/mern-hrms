const mongoose = require("mongoose");

const Role = require("../models/Role");
const Permission = require("../models/Permission");

class RoleService {
    async createRole(payload, userId) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const existingRole = await Role.findOne({
                code: payload.code.toLowerCase(),
            });

            if (existingRole) {
                throw new Error("Role already exists");
            }

            const permissions = await Permission.find({
                _id: { $in: payload.permissions || [] },
            });

            const role = await Role.create(
                [
                    {
                        name: payload.name,
                        code: payload.code.toLowerCase(),
                        description: payload.description,
                        permissions: permissions.map((p) => p._id),
                        createdBy: userId,
                        updatedBy: userId,
                    },
                ],
                { session }
            );

            await session.commitTransaction();

            return role[0];
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getRoleById(roleId) {
        const role = await Role.findById(roleId)
            .populate("permissions")
            .lean();

        if (!role) {
            throw new Error("Role not found");
        }

        return role;
    }

    async getRoles({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
    }) {
        const query = {};

        if (search) {
            query.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    code: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const skip = (page - 1) * limit;

        const [roles, total] = await Promise.all([
            Role.find(query)
                .populate("permissions")
                .sort({
                    [sortBy]:
                        sortOrder === "asc" ? 1 : -1,
                })
                .skip(skip)
                .limit(limit),

            Role.countDocuments(query),
        ]);

        return {
            data: roles,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateRole(roleId, payload, userId) {
        const role = await Role.findById(roleId);

        if (!role) {
            throw new Error("Role not found");
        }

        if (role.isSystemRole) {
            throw new Error(
                "System roles cannot be modified"
            );
        }

        role.name = payload.name || role.name;
        role.description =
            payload.description || role.description;

        role.updatedBy = userId;

        if (payload.permissions) {
            role.permissions = payload.permissions;
        }

        await role.save();

        return role.populate("permissions");
    }

    async deleteRole(roleId) {
        const role = await Role.findById(roleId);

        if (!role) {
            throw new Error("Role not found");
        }

        if (role.isSystemRole) {
            throw new Error(
                "System roles cannot be deleted"
            );
        }

        await role.deleteOne();

        return true;
    }

    async cloneRole(
        sourceRoleId,
        newRoleName,
        newRoleCode,
        userId
    ) {
        const sourceRole =
            await Role.findById(sourceRoleId);

        if (!sourceRole) {
            throw new Error("Source role not found");
        }

        const role = await Role.create({
            name: newRoleName,
            code: newRoleCode.toLowerCase(),
            permissions:
                sourceRole.permissions,
            description:
                sourceRole.description,
            createdBy: userId,
            updatedBy: userId,
        });

        return role;
    }

    async assignPermissions(
        roleId,
        permissionIds,
        userId
    ) {
        const role =
            await Role.findById(roleId);

        if (!role) {
            throw new Error("Role not found");
        }

        role.permissions = permissionIds;
        role.updatedBy = userId;

        await role.save();

        return role.populate("permissions");
    }
}

module.exports = new RoleService();