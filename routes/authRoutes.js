const Router = require("express").Router;
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

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

const authRouter = Router();

authRouter.post("/signup", validate(addUserSchema), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password: pass } = req.body;
    const password = await bcrypt.hash(pass, 10);
    const uid = generateRandomString();

    if (await getRow("User", { email }))
      return res.json({ status: false, msg: "User already exists" });

    const user = await db.pgDataSource
      .getRepository("User")
      .save({ name, email, password, uid });

    const token = generateToken(user);

    res.json({
      status: true,
      msg: "Account created successfully",
      data: { name: user.name, email: user.email, uid: user.uid, token },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const user = await getRow("User", { email });
    if (!user)
      return res.json({ status: false, msg: "Incorrect email or password" });

    const matchPass = await bcrypt.compare(password, userExists.password);
    if (!matchPass)
      return res.json({ status: false, msg: "Incorrect email or password" });

    const token = generateToken(userExists);

    res.json({
      status: true,
      msg: "Logged in",
      data: {
        name: userExists.name,
        email: userExists.email,
        uid: userExists.uid,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.use(authMiddleware);

authRouter.get("/me", (req, res) => {
  try {
    res.json({ status: true, msg: "User details", data: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Internal server error" });
  }
});

module.exports = authRouter;
