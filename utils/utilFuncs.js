const crypto = require("crypto");
const { CIPHER_PREFIX } = require("../constants");
const db = require("../datasource/pg");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const generateRandomString = (length = 16) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const createHash = (str, len) => {
  return crypto
    .createHash("sha512")
    .update(CIPHER_PREFIX)
    .update(str)
    .digest()
    .toString("hex")
    .substring(0, len);
};

const generateToken = (user) => {
  const payload = {
    name: user.name,
    uid: user.uid,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
    issuer: "envoix-server",
    audience: "envoix-cli",
  });

  return token;
};

const getRow = async (repo, params) => {
  try {
    const row = await db.pgDataSource.getRepository(repo).findOneBy(params);
    return row;
  } catch (error) {
    return null;
  }
};

module.exports = { generateRandomString, createHash, generateToken, getRow };
