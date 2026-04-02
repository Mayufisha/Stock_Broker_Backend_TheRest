const Stock = require("../models/Stock");

const getStocks = async (_req, res) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    return res.json({ stocks });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getStockBySymbol = async (req, res) => {
  try {
    const symbol = String(req.params.symbol || "").trim().toUpperCase();
    const stock = await Stock.findOne({ symbol });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    return res.json({ stock });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const refreshStocks = async (_req, res) => {
  try {
    const stocks = await Stock.find();

    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const delta = -2.5 + (5 * Math.random());
        const nextPrice = Math.max(1, stock.price + delta);
        const nextChangePercent = (delta / stock.price) * 100;

        stock.price = Number(nextPrice.toFixed(2));
        stock.changePercent = Number(nextChangePercent.toFixed(2));
        await stock.save();
        return stock;
      })
    );

    return res.json({ stocks: updatedStocks });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStocks,
  getStockBySymbol,
  refreshStocks,
};
