const Stock = require("../models/Stock");
const defaultStocks = require("../data/defaultStocks");

const seedStocks = async () => {
  const count = await Stock.countDocuments();
  if (count === 0) {
    await Stock.insertMany(defaultStocks);
  }
};

module.exports = seedStocks;
