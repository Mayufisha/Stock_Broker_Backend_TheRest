const mongoose = require("mongoose");                                                           
                                                                                                  
  const userSchema = new mongoose.Schema(                                                         
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    passwordHash: { type: String, required: true },
  },
    { timestamps: true }                                                                          
  );                                                                                              
                                                                                                  
  module.exports = mongoose.model("User", userSchema);  
