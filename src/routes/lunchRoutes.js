const express = require("express");
const { fetchLunchData } = require("../controllers/lunchController");

const router = express.Router();

router.get("/fetchLunchData", fetchLunchData);

module.exports = router;
