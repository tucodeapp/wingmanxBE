const app = require("./app");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("mongoose connected");

    app.listen(process.env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch(console.error);
