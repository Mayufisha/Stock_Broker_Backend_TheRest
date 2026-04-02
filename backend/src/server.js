require("dotenv").config();                                                
  const express = require("express");                                        
  const cors = require("cors");                                              
                                                                             
  const authRoutes = require("./routes/auth");
  const portfolioRoutes = require("./routes/portfolio");
  const stockRoutes = require("./routes/stocks");
  const tradesRoutes = require("./routes/trades");
  const transactionRoutes = require("./routes/transactions");
                                                                             
  const app = express();                                                     
                                                                             
  app.use(cors());                                                           
  app.use(express.json());                                                   
                                                                             
  app.use("/auth", authRoutes);
  app.use("/portfolio", portfolioRoutes);
  app.use("/stocks", stockRoutes);
  app.use("/trades", tradesRoutes);
  app.use("/transactions", transactionRoutes);
                                                                             
  app.get("/", (req, res) => {                                               
    res.json({ status: "ok" });                                              
  });                                                                        
                                                                             
  const PORT = process.env.PORT || 5000;                                     
                                                                             
  const connectDB = require("./config/db");
  const seedStocks = require("./utils/seedStocks");
  connectDB()
    .then(() => {
      return seedStocks();
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("DB connection failed:", err);
      process.exit(1);
    });
             
