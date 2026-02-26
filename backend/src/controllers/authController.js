const bcrypt = require("bcrypt");                                                               
  const jwt = require("jsonwebtoken");                                                            
  const User = require("../models/User");                                                         
                                                                                                  
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                                                  
  const signup = async (req, res) => {                                                            
    try {                                                                                         
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-12 chars and include uppercase, lowercase, number, and special (!@#$%^&*)",
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }
                                                                                                  
      const passwordHash = await bcrypt.hash(password, 10);                                       
    const user = await User.create({ email: normalizedEmail, passwordHash });
                                                                                                  
      const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {                         
        expiresIn: "7d",                                                                          
      });                                                                                         
                                                                                                  
      return res.status(201).json({ token });                                                     
    } catch (err) {                                                                               
      return res.status(500).json({ message: "Server error" });                                   
    }                                                                                             
  };                                                                                              
                                                                                                  
  const login = async (req, res) => {                                                             
    try {                                                                                         
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email: normalizedEmail });
      if (!user) {                                                                                
        return res.status(401).json({ message: "Invalid credentials" });                          
      }                                                                                           
                                                                                                  
      const ok = await bcrypt.compare(password, user.passwordHash);                               
      if (!ok) {                                                                                  
        return res.status(401).json({ message: "Invalid credentials" });                          
      }                                                                                           
                                                                                                  
      const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {                         
        expiresIn: "7d",                                                                          
      });                                                                                         
                                                                                                  
      return res.json({ token });                                                                 
    } catch (err) {                                                                               
      return res.status(500).json({ message: "Server error" });                                   
    }                                                                                             
  };                                                                                              
                                                                                                  
  const me = async (req, res) => {                                                                
    try {                                                                                         
      const user = await User.findById(req.user.id).select("_id email createdAt");                
      if (!user) {                                                                                
        return res.status(404).json({ message: "User not found" });                               
      }                                                                                           
      return res.json({ user });                                                                  
    } catch (err) {                                                                               
      return res.status(500).json({ message: "Server error" });                                   
    }                                                                                             
  };                                                                                              
                                                                                                  
  module.exports = { signup, login, me };
