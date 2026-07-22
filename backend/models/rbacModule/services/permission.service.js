const Permission = require(
    "../models/Permission"
);

class PermissionService {
    async createPermission(payload) {
        const exists =
            await Permission.findOne({
                code: payload.code,
            });

        if (exists) {
            throw new Error(
                "Permission already exists"
            );
        }

        return Permission.create(payload);
    }

    async getAllPermissions() {
        return Permission.find()
            .sort({
                module: 1,
                action: 1,
            })
            .lean();
    }

    async getPermissionById(id) {
        const permission =
            await Permission.findById(id);

        if (!permission) {
            throw new Error(
                "Permission not found"
            );
        }

        return permission;
    }

    async updatePermission(
        id,
        payload
    ) {
        const permission =
            await Permission.findByIdAndUpdate(
                id,
                payload,
                {
                    new: true,
                }
            );

        if (!permission) {
            throw new Error(
                "Permission not found"
            );
        }

        return permission;
    }

    async deletePermission(id) {
        const permission =
            await Permission.findById(id);

        if (!permission) {
            throw new Error(
                "Permission not found"
            );
        }

        if (permission.isSystemPermission) {
            throw new Error(
                "Cannot delete system permission"
            );
        }

        await permission.deleteOne();

        return true;
    }
}

module.exports =
    new PermissionService();