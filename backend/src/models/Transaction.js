const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["INITIAL_BALANCE", "DEPOSIT", "WITHDRAW", "BUY", "SELL"],
      default: null,
    },
    symbol: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    stockName: {
      type: String,
      default: null,
      trim: true,
    },
    shares: {
      type: Number,
      default: null,
      min: 1,
    },
    pricePerShare: {
      type: Number,
      default: null,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    side: {
      type: String,
      enum: ["buy", "sell"],
      default: null,
    },
    qty: {
      type: Number,
      default: null,
      min: 1,
    },
    price: {
      type: Number,
      default: null,
      min: 0,
    },
    total: {
      type: Number,
      default: null,
      min: 0,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
