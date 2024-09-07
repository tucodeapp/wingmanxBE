const { cleanEnv, str, port } = require("envalid");

cleanEnv(process.env, {
  MONGO_CONNECTION_STRING: str(),
  PORT: port(),
  JWT_SECRET: str(),
});

module.exports = {
  cleanEnv,
};
