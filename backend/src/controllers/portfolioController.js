const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");

const normalizeSymbol = (value) => String(value || "").trim().toUpperCase();
const normalizeName = (value) => String(value || "").trim();

const getOrCreatePortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({ userId, cashBalance: 0, holdings: [] });
  }
  return portfolio;
};

const buildPortfolioResponse = (portfolio) => {
  const holdingsValue = Number(
    portfolio.holdings
      .reduce((sum, holding) => sum + (holding.shares * holding.avgPrice), 0)
      .toFixed(2)
  );
  const cashBalance = Number(portfolio.cashBalance.toFixed(2));

  return {
    cashBalance,
    holdings: portfolio.holdings,
    holdingsValue,
    totalValue: Number((cashBalance + holdingsValue).toFixed(2)),
  };
};

const getPortfolio = async (req, res) => {
  try {
    const portfolio = await getOrCreatePortfolio(req.user.id);
    return res.json({ portfolio: buildPortfolioResponse(portfolio) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const updateCash = async (req, res) => {
  try {
    const { action, amount } = req.body || {};
    const normalizedAction = String(action || "").trim().toLowerCase();
    const numericAmount = Number(amount);

    if (!["deposit", "withdraw"].includes(normalizedAction)) {
      return res.status(400).json({ message: "Action must be 'deposit' or 'withdraw'" });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a number greater than 0" });
    }

    const portfolio = await getOrCreatePortfolio(req.user.id);

    if (normalizedAction === "withdraw" && numericAmount > portfolio.cashBalance) {
      return res.status(400).json({ message: "Insufficient cash balance" });
    }

    portfolio.cashBalance =
      normalizedAction === "deposit"
        ? portfolio.cashBalance + numericAmount
        : portfolio.cashBalance - numericAmount;

    await portfolio.save();

    return res.json({
      message: normalizedAction === "deposit" ? "Cash deposited" : "Cash withdrawn",
      portfolio: buildPortfolioResponse(portfolio),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const createTrade = async (req, res) => {
  try {
    const { symbol, name, side, shares, price } = req.body || {};

    const normalizedSymbol = normalizeSymbol(symbol);
    const normalizedName = normalizeName(name);
    const normalizedSide = String(side || "").trim().toLowerCase();
    const numericShares = Number(shares);
    const numericPrice = Number(price);

    if (!normalizedSymbol || !normalizedName) {
      return res.status(400).json({ message: "Symbol and name are required" });
    }

    if (!["buy", "sell"].includes(normalizedSide)) {
      return res.status(400).json({ message: "Side must be 'buy' or 'sell'" });
    }

    if (!Number.isInteger(numericShares) || numericShares <= 0) {
      return res.status(400).json({ message: "Shares must be an integer greater than 0" });
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a number greater than 0" });
    }

    const total = Number((numericShares * numericPrice).toFixed(2));
    const portfolio = await getOrCreatePortfolio(req.user.id);

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === normalizedSymbol
    );

    if (normalizedSide === "buy") {
      if (total > portfolio.cashBalance) {
        return res.status(400).json({ message: "Insufficient cash balance" });
      }

      if (holdingIndex < 0) {
        portfolio.holdings.push({
          symbol: normalizedSymbol,
          name: normalizedName,
          shares: numericShares,
          avgPrice: numericPrice,
        });
      } else {
        const existing = portfolio.holdings[holdingIndex];
        const newShares = existing.shares + numericShares;
        const newAvgPrice =
          ((existing.avgPrice * existing.shares) + total) / newShares;

        existing.name = normalizedName;
        existing.shares = newShares;
        existing.avgPrice = Number(newAvgPrice.toFixed(4));
      }

      portfolio.cashBalance = Number((portfolio.cashBalance - total).toFixed(2));
    } else {
      if (holdingIndex < 0) {
        return res.status(400).json({ message: `No holdings found for ${normalizedSymbol}` });
      }

      const existing = portfolio.holdings[holdingIndex];
      if (numericShares > existing.shares) {
        return res.status(400).json({ message: "Cannot sell more shares than owned" });
      }

      existing.shares -= numericShares;
      if (existing.shares === 0) {
        portfolio.holdings.splice(holdingIndex, 1);
      }

      portfolio.cashBalance = Number((portfolio.cashBalance + total).toFixed(2));
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type: normalizedSide === "buy" ? "BUY" : "SELL",
      symbol: normalizedSymbol,
      stockName: normalizedName,
      shares: numericShares,
      pricePerShare: numericPrice,
      totalAmount: total,
      side: normalizedSide,
      qty: numericShares,
      price: numericPrice,
      total,
    });

    await portfolio.save();

    return res.status(201).json({
      message: `${normalizedSide === "buy" ? "Bought" : "Sold"} ${numericShares} ${normalizedSymbol}`,
      transaction,
      portfolio: buildPortfolioResponse(portfolio),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPortfolio,
  updateCash,
  createTrade,
};
