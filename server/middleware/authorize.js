function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userPermissions =
      req.user.role?.permissions?.map(
        (permission) => permission.name
      ) || [];

    const hasPermission = requiredPermissions.every(
      (permission) =>
        userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}

module.exports = authorize;