require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const admin = require("firebase-admin");

var serviceAccount = require("../netzet-family-firebase-adminsdk-8s6of-a211c2f750.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongoose connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
