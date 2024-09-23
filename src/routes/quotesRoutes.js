const express = require("express");
const { fetchSingleQuote } = require("../controllers/quotesController");

const router = express.Router();

router.get("/fetchSingleQuote", fetchSingleQuote);

module.exports = router;
