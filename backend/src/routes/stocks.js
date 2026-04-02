const express = require("express");
const {
  getStocks,
  getStockBySymbol,
  refreshStocks,
} = require("../controllers/stockController");

const router = express.Router();

router.get("/", getStocks);
router.get("/:symbol", getStockBySymbol);
router.post("/refresh", refreshStocks);

module.exports = router;
