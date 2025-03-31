const { getRow } = require("../utils/utilFuncs");

const permissionMiddleware = async (req, res, next) => {
  const { env_id } = req.params;
  if(!env_id) {
      return res.json({ status: false, msg: "Environment not found" });
  }
  const permissions = await getRow("envPermissions", {
    env_id: req.params.env_id,
    user_email: req.user.email,
  });
  req.permissions = permissions;
  if (!permissions) {
    return res.json({ status: false, msg: "Permission denied" });
  }
  next();
};

module.exports = permissionMiddleware;
