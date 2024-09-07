const app = require("./app");
const env = require("./utils/validateEnv");
const mongoose = require("mongoose");

mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("mongoose connected");

    app.listen(env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch(console.error);
