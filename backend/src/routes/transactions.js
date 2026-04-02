const express = require("express");
const auth = require("../middleware/auth");
const {
  listTransactions,
  createTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", auth, listTransactions);
router.post("/", auth, createTransaction);

module.exports = router;
