const { body } = require("express-validator");

const updateEnvSchema = [
  body("env_data"),
  body("password")
];

module.exports = { updateEnvSchema };
