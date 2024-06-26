const Router = require("express").Router;
const { body } = require("express-validator");

const { validate } = require("../utils/validate");
const db = require("../datasource/pg");
const { permissionSchema } = require("../schemas/permissionSchema");
const EncryptionService = require("../utils/encryption");
const accessGaurd = require("../middlewares/accessGaurd");
const { getRow } = require("../utils/utilFuncs");
const encFactory = new EncryptionService();

const permissionRouter = Router();

permissionRouter.post(
  "/:env_id/",
  validate(permissionSchema),
  accessGaurd(["add_user"]),
  async (req, res, next) => {
    try {
      const { user_email, permission, password, otp } = req.body;

      const user = await getRow("User", { email: user_email });
      if (!user) return res.json({ status: false, msg: "User not found" });

      const env = await getRow("envs", { env_id: req.params.env_id });
      if (!env)
        return res.json({ status: false, msg: "Environment not found" });

      const prev_perms = await getRow("envPermissions", {
        env_id: req.params.env_id,
        user_email,
      });
      if (prev_perms)
        return res.json({ status: false, msg: "Permission already exists" });

      const mek = encFactory.decrypt(
        req.permissions.kek,
        password,
        req.user.uid
      );
      const new_user_kek = encFactory.encrypt(mek, otp, user.uid);

      await db.pgDataSource.getRepository("envPermissions").save({
        env_id: req.params.env_id,
        user_email,
        permission,
        kek: new_user_kek,
      });
      res.json({ status: true, msg: "Permission added" });
    } catch (error) {
      next(error);
    }
  }
);

permissionRouter.put(
  "/:env_id",
  validate(permissionSchema),
  accessGaurd(["update_user"]),
  async (req, res, next) => {
    try {
      const { user_email, permission } = req.body;
      const env = await getRow("envs", { env_id: req.params.env_id });
      if (!env)
        return res.json({ status: false, msg: "Environment not found" });

      const prev_perms = await getRow("envPermissions", {
        env_id: req.params.env_id,
        user_email,
      });
      if (!prev_perms)
        return res.json({ status: false, msg: "Permission not found" });

      await db.pgDataSource
        .getRepository("envPermissions")
        .update({ env_id: req.params.env_id, user_email }, { permission });
      res.json({ status: true, msg: "Permission updated" });
    } catch (error) {
      next(error);
    }
  }
);

permissionRouter.delete(
  "/:env_id",
  body("user_email").isEmail().withMessage("Invalid email"),
  accessGaurd(["remove_user"]),
  async (req, res, next) => {
    try {
      const { user_email } = req.body;

      const env = await getRow("envs", { env_id: req.params.env_id });
      if (!env)
        return res.json({ status: false, msg: "Environment not found" });

      const prev_perms = await getRow("envPermissions", {
        env_id: req.params.env_id,
        user_email,
      });
      if (!prev_perms)
        return res.json({ status: false, msg: "Permission not found" });

      await db.pgDataSource
        .getRepository("envPermissions")
        .delete({ env_id: req.params.env_id, user_email });
      res.json({ status: true, msg: "Permission removed" });
    } catch (error) {
      next(error);
    }
  }
);

permissionRouter.get("/:env_id", accessGaurd(), async (req, res, next) => {
  try {
    const env = await db.pgDataSource
      .getRepository("envs")
      .findOneBy({ env_id: req.params.env_id, owner: req.user.uid });

    if (!env) {
      return res.json({ status: false, msg: "Permission denied" });
    }

    const permissions = await db.pgDataSource
      .getRepository("envPermissions")
      .findBy({ env_id: req.params.env_id });
    res.json({
      status: true,
      msg: "Permissions",
      data: permissions.map((obj) => ({
        user_email: obj.user_email,
        permission: obj.permission,
      })),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = permissionRouter;
