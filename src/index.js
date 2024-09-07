require("dotenv").config(); // Load environment variables first
const mongoose = require("mongoose");
const app = require("./app"); // Import the app after loading environment variables

const PORT = process.env.PORT || 3000; // Default to port 3000 if not set

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
