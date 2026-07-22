module.exports =
    (...requiredPermissions) =>
        async (req, res, next) => {
            try {
                const user = req.user;

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized",
                    });
                }

                await user.populate({
                    path: "role",
                    populate: {
                        path: "permissions",
                    },
                });

                const userPermissions =
                    user.role.permissions.map(
                        (permission) => permission.code
                    );

                const allowed =
                    requiredPermissions.every(
                        (permission) =>
                            userPermissions.includes(permission)
                    );

                if (!allowed) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "You don't have permission to perform this action",
                    });
                }

                next();
            } catch (error) {
                next(error);
            }
        };