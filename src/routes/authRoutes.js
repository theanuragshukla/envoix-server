/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

const Router = require("express").Router;
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middlewares/authMiddleware");
const db = require("../datasource/pg");
const {
  generateRandomString,
  generateToken,
  getRow,
} = require("../utils/utilFuncs");
const { validate } = require("../utils/validate");
const { loginSchema } = require("../schemas/loginSchema");
const { addUserSchema } = require("../schemas/PostUsers");
const { SALTRounds, DB_REPOS } = require("../constants");

const authRouter = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupDTO'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponseDTO'
 */

authRouter.post("/signup", validate(addUserSchema), async (req, res, next) => {
  try {
    const { name, email, password: pass } = req.body;
    const password = await bcrypt.hash(pass, SALTRounds);
    const uid = generateRandomString();

    if (await getRow(DB_REPOS.USER, { email }))
      return res.json({ status: false, msg: "User already exists" });

    const user = await db.pgDataSource
      .getRepository(DB_REPOS.USER)
      .save({ name, email, password, uid });

    const token = generateToken(user);

    if (!token) {
      return next("Something went wrong");
    }

    res.json({
      status: true,
      msg: "Account created successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
          uid: user.uid,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDTO'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponseDTO'
 */

authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await getRow(DB_REPOS.USER, { email });
    if (!existingUser)
      return res.json({ status: false, msg: "Incorrect email or password" });

    const matchPass = await bcrypt.compare(password, existingUser.password);
    if (!matchPass)
      return res.json({ status: false, msg: "Incorrect email or password" });

    const token = generateToken(existingUser);
    if (!token) {
      return next("Something went wrong");
    }

    res.json({
      status: true,
      msg: "Logged in",
      data: {
        user: {
          name: existingUser.name,
          email: existingUser.email,
          uid: existingUser.uid,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user details
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       200:
 *         description: Current user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProfileData'
 *       401:
 *         description: Unauthorized (invalid/missing token)
 */

authRouter.use(authMiddleware);

authRouter.get("/me", (req, res) => {
  try {
    const { name, uid, email } = req.user;
    res.json({
      status: true,
      msg: "User details",
      data: {
        name,
        uid,
        email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Internal server error" });
  }
});

module.exports = authRouter;
