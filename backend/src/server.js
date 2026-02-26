require("dotenv").config();                                                
  const express = require("express");                                        
  const cors = require("cors");                                              
                                                                             
  const authRoutes = require("./routes/auth");                               
                                                                             
  const app = express();                                                     
                                                                             
  app.use(cors());                                                           
  app.use(express.json());                                                   
                                                                             
  app.use("/auth", authRoutes);                                              
                                                                             
  app.get("/", (req, res) => {                                               
    res.json({ status: "ok" });                                              
  });                                                                        
                                                                             
  const PORT = process.env.PORT || 5000;                                     
                                                                             
  const connectDB = require("./config/db");
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("DB connection failed:", err);
      process.exit(1);
    });
             