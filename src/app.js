const express = require("express");
const userRoutes = require("./routes/userRoutes");
const quotesRoutes = require("./routes/quotesRoutes");

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/quotes", quotesRoutes);

module.exports = app;
