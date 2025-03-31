/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Environment permissions management
 */


const Router = require("express").Router;
const { body } = require("express-validator");

const { validate } = require("../utils/validate");
const db = require("../datasource/pg");
const { permissionSchema } = require("../schemas/permissionSchema");
const EncryptionService = require("../utils/encryption");
const accessGaurd = require("../middlewares/accessGaurd");
const { getRow } = require("../utils/utilFuncs");
const encFactory = new EncryptionService();

const permissionRouter = Router({mergeParams: true});


/**
 * @swagger
 * /envs/{env_id}/permissions/add_user:
 *   post:
 *     summary: Add user to environment
 *     tags: [Permissions]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: env_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Environment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_email
 *               - permission
 *               - password
 *               - otp
 *             properties:
 *               user_email:
 *                 type: string
 *                 format: email
 *               permission:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [pull, push, add_user, update_user, remove_user, admin]
 *               password:
 *                 type: string
 *                 format: password
 *               otp:
 *                 type: string
 *                 description: One-time password for the new user
 *     responses:
 *       200:
 *         description: Permission added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 */

permissionRouter.post(
  "/add_user",
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

/**
 * @swagger
 * /envs/{env_id}/permissions/update_user:
 *   put:
 *     summary: Update user permissions
 *     tags: [Permissions]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: env_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Environment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_email
 *               - permission
 *             properties:
 *               user_email:
 *                 type: string
 *                 format: email
 *               permission:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [pull, push, add_user, update_user, remove_user, admin]
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */

permissionRouter.put(
  "/update_user",
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


/**
 * @swagger
 * /envs/{env_id}/permissions/remove_user:
 *   delete:
 *     summary: Remove user from environment
 *     tags: [Permissions]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: env_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Environment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_email
 *             properties:
 *               user_email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */

permissionRouter.delete(
  "/remove_user",
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


/**
 * @swagger
 * /envs/{env_id}/permissions/all:
 *   get:
 *     summary: Get all permissions for an environment
 *     tags: [Permissions]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: env_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Environment ID
 *     responses:
 *       200:
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 */

permissionRouter.get("/all", accessGaurd(), async (req, res, next) => {
  try {
    const { env_id } = req.params;
    if(!env_id || !req.user.uid) {
      return res.json({ status: false, msg: "Environment not found" });
    }
    const env = await db.pgDataSource
      .getRepository("envs")
      .findOneBy({ env_id: env_id  , owner: req.user.uid });

    if (!env) {
      return res.json({ status: false, msg: "Permission denied" });
    }

    const permissions = await db.pgDataSource
      .getRepository("envPermissions")
      .findBy({ env_id });
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
