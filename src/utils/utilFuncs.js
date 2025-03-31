const crypto = require("crypto");
const { CIPHER_PREFIX, JWT_EXPIRES, JWT_ISSUER, JWT_AUDIENCE } = require("../constants");
const db = require("../datasource/pg");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const generateRandomString = (length = 16) => {
  const randomBytes = crypto.randomBytes(length);
  return randomBytes.toString("hex").substring(0, length);
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
  try{
  const payload = {
    name: user.name,
    uid: user.uid,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  return token;
  } catch (error) {
    console.error("Error generating token", error);
    return null;
  }
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
