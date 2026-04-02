const express = require("express");
const auth = require("../middleware/auth");
const { createTrade } = require("../controllers/portfolioController");

const router = express.Router();

router.post("/", auth, createTrade);

module.exports = router;
