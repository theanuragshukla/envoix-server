/**
 * @swagger
 * tags:
 *   name: Environments
 *   description: Environment variables management
 */

const Router = require("express").Router;
const crypto = require("crypto");

const { validate } = require("../utils/validate");
const { addEnvSchema } = require("../schemas/addEnvSchema");
const permissionMiddleware = require("../middlewares/permissionMiddleware");
const db = require("../datasource/pg");
const { accessEnvSchema } = require("../schemas/accessEnv");
const EncryptionService = require("../utils/encryption");
const accessGaurd = require("../middlewares/accessGaurd");
const permissionRouter = require("./permissionRouter");
const { getRow } = require("../utils/utilFuncs");
const { DB_REPOS } = require("../constants");
const { updateEnvSchema } = require("../schemas/updateEnvSchema");
const encFactory = new EncryptionService();

const envRouter = Router();

/**
 * @swagger
 * /envs/all:
 *   get:
 *     summary: Get all environments for the user
 *     tags: [Environments]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       200:
 *         description: All environments
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/EnvironmentListResponse'
 */

envRouter.get("/all", async (req, res, next) => {
  try {
    const envs = await db.pgDataSource
      .getRepository(DB_REPOS.ENVS)
    .find({
        select: {
          name: true,
          env_id: true,
        }, 
        where: {
          owner: req.user.uid
        }
      });
    res.json({ status: true, msg: "All environments", data: envs });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /envs/create:
 *   post:
 *     summary: Create a new environment
 *     tags: [Environments]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnvironmentCreateDTO'
 *     responses:
 *       200:
 *         description: Environment created successfully
 *         content:
 *           application/json:
 *             schema:
*                $ref: '#/components/schemas/EnvironmentOperationResponse'
 */

envRouter.post("/create", validate(addEnvSchema), async (req, res, next) => {
  try {
    const { name, env_data, env_path, password } = req.body;

    const envId = crypto.randomUUID();
    const mek = crypto.randomBytes(128).toString("hex");
    const env_data_enc = encFactory.encrypt(env_data || "", mek, envId);
    const kek = encFactory.encrypt(mek, password, req.user.uid);
    let env;

    await db.pgDataSource.manager.transaction(async (manager) => {
      env = await manager.getRepository("envs").save({
        env_id: envId,
        name,
        env_path,
        env_data: env_data_enc,
        owner: req.user.uid,
      });
      await manager.getRepository("envPermissions").save({
        env_id: envId,
        permission: ["admin"],
        user_email: req.user.email,
        kek,
        password_changed: true,
      });
    });

    res.json({
      status: true,
      msg: "Environment added",
      data: {
        env_id: env.env_id,
        name: env.name,
        env_path: env.env_path,
      },
    });
  } catch (error) {
    next(error);
  }
});

envRouter.use("/:env_id", permissionMiddleware);


/**
 * @swagger
 * /envs/{env_id}/pull:
 *   post:
 *     summary: Pull environment variables
 *     tags: [Environments]
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
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               oneTimePassword:
 *                 type: string
 *                 description: Required if password hasn't been changed yet
 *     responses:
 *       200:
 *         description: Environment data
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
 *                   type: object
 *                   properties:
 *                     env_id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     env_path:
 *                       type: string
 *                     env_data:
 *                       type: string
 */
envRouter.post(
  "/:env_id/pull",
  validate(accessEnvSchema),
  accessGaurd(["pull"]),
  async (req, res, next) => {
    try {
      const { password, oneTimePassword } = req.body;

      const env = await getRow("envs", { env_id: req.params.env_id });

      if (!env)
        return res.json({ status: false, msg: "Environment not found" });

      let mek;

      if (!req.permissions.password_changed) {
        if (!!oneTimePassword) {
          mek = encFactory.decrypt(
            req.permissions.kek,
            oneTimePassword,
            req.user.uid
          );

          const kek = encFactory.encrypt(mek, password, req.user.uid);
          await db.pgDataSource
            .getRepository("envPermissions")
            .update(
              { env_id: req.params.env_id, user_email: req.user.email },
              { kek, password_changed: true }
            );
        } else {
          return res
            .status(400)
            .json({ status: false, msg: "Password not changed" });
        }
      } else {
        mek = encFactory.decrypt(req.permissions.kek, password, req.user.uid);
      }

      const env_data = encFactory.decrypt(env.env_data, mek, req.params.env_id);
      env.env_data = env_data;

      const { env_id, name, env_path } = env;

      env.env_data = env_data;
      return res.json({ status: true, msg: "Environment", data: {
        env_id,
        name,
        env_path,
        env_data
      } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /envs/{env_id}/push:
 *   put:
 *     summary: Update environment variables
 *     tags: [Environments]
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
 *             $ref: '#/components/schemas/EnvironmentUpdateDTO'
 *     responses:
 *       200:
 *         description: Environment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 */
envRouter.put(
  "/:env_id/push",
  validate(updateEnvSchema),
  accessGaurd(["push"]),
  async (req, res, next) => {
    try {
      const { env_data, password } = req.body;

      const env = await getRow("envs", { env_id: req.params.env_id });
      if (!env) {
        return res.json({ status: false, msg: "Environment not found" });
      }

      const mek = encFactory.decrypt(
        req.permissions.kek,
        password,
        req.user.uid
      );
      const env_data_enc = encFactory.encrypt(env_data, mek, req.params.env_id);
      await db.pgDataSource
        .getRepository("envs")
        .update({ env_id: req.params.env_id }, { env_data: env_data_enc });
      res.json({ status: true, msg: "Environment updated" });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * @swagger
 * /envs/{env_id}/delete:
 *   delete:
 *     summary: Delete an environment
 *     tags: [Environments]
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
 *         description: Environment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 */

envRouter.delete("/:env_id/delete", accessGaurd(), async (req, res, next) => {
  try {
    const env = await getRow("envs", {
      env_id: req.params.env_id,
      owner: req.user.uid,
    });
    if (!env) {
      return res.json({ status: false, msg: "Environment not found" });
    }
    await db.pgDataSource
      .getRepository("envs")
      .delete({ env_id: req.params.env_id, owner: req.user.uid });
    res.json({ status: true, msg: "Environment deleted" });
  } catch (error) {
    next(error);
  }
});

envRouter.use('/:env_id/permissions', permissionRouter);

module.exports = envRouter;
