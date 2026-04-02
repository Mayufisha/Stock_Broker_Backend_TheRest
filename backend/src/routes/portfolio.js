const express = require("express");
const auth = require("../middleware/auth");
const { getPortfolio, updateCash } = require("../controllers/portfolioController");

const router = express.Router();

router.get("/", auth, getPortfolio);
router.patch("/cash", auth, updateCash);

module.exports = router;
