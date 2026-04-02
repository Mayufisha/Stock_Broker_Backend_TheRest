const bcrypt = require("bcrypt");                                                               
  const jwt = require("jsonwebtoken");                                                            
  const User = require("../models/User");                                                         
                                                                                                  
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const normalizeUsername = (value) => String(value || "").trim().toLowerCase();
const normalizeFullName = (value) => String(value || "").trim();
                                                                                                  
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
      const user = await User.findById(req.user.id).select("_id email username fullName createdAt");
      if (!user) {                                                                                
        return res.status(404).json({ message: "User not found" });                               
      }                                                                                           
      return res.json({ user });                                                                  
    } catch (err) {                                                                               
      return res.status(500).json({ message: "Server error" });                                   
    }                                                                                             
  };                                                                                              

const updateMe = async (req, res) => {
  try {
    const { username, fullName } = req.body || {};
    const normalizedUsername = normalizeUsername(username);
    const normalizedFullName = normalizeFullName(fullName);

    if (!normalizedUsername && !normalizedFullName) {
      return res.status(400).json({ message: "Username or full name is required" });
    }

    if (normalizedUsername && !USERNAME_REGEX.test(normalizedUsername)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters and use only lowercase letters, numbers, or underscores",
      });
    }

    if (normalizedFullName.length > 50) {
      return res.status(400).json({ message: "Full name must be 50 characters or less" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (normalizedUsername) {
      const existing = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: req.user.id },
      });
      if (existing) {
        return res.status(409).json({ message: "Username already in use" });
      }
      user.username = normalizedUsername;
    }

    if (normalizedFullName) {
      user.fullName = normalizedFullName;
    }

    await user.save();

    return res.json({
      message: "Profile updated",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
                                                                                                  
  module.exports = { signup, login, me, updateMe };
