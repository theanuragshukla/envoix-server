const permissions = ["push", "pull", "admin", "add_user", "remove_user", "update_user"]
const ISSUER = "envoix";
const CIPHER_PREFIX = "Mr^&PVNbTdE@7j5r9MNFwNy3VE^%twWx&SrFo9o&84VN$b#FS9rNeNj";
const SALTRounds = 10;
const DB_REPOS = {
  USER: "User",
  ENVS: "envs",
}
const JWT_EXPIRES = "30d";
const JWT_AUDIENCE = "envoix-cli";
const JWT_ISSUER = "envoix-server";
const AUTH_HEADER = "x-auth-token"

module.exports = {
  permissions,
  ISSUER,
  CIPHER_PREFIX,
  SALTRounds,
  DB_REPOS,
  JWT_ISSUER, 
  JWT_EXPIRES,
  JWT_AUDIENCE,
  AUTH_HEADER
};
