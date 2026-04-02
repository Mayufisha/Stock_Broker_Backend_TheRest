const Transaction = require("../models/Transaction");

const ALLOWED_TYPES = [
  "INITIAL_BALANCE",
  "DEPOSIT",
  "WITHDRAW",
  "BUY",
  "SELL",
];

const listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1, timestamp: -1 });

    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const {
      type,
      symbol = null,
      stockName = null,
      shares = null,
      pricePerShare = null,
      totalAmount,
    } = req.body || {};

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (totalAmount === undefined || totalAmount === null || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "totalAmount must be greater than 0" });
    }

    if ((type === "BUY" || type === "SELL") && (!symbol || !shares || !pricePerShare)) {
      return res.status(400).json({
        message: "BUY and SELL transactions require symbol, shares, and pricePerShare",
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      symbol,
      stockName,
      shares,
      pricePerShare,
      totalAmount,
    });

    return res.status(201).json(transaction);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listTransactions,
  createTransaction,
};
