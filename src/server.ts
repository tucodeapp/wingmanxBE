import app from "./app";
import env from "./utils/validateEnv";
import mongoose from "mongoose";

mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("mongoose connected");

    app.listen(env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch(console.error);
