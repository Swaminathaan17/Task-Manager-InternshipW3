import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const createToken = userId => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    const normalized = email.toLowerCase();
    if (await User.findOne({ email: normalized }))
      return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({
      name,
      email: normalized,
      password: await bcrypt.hash(password, 12)
    });
    res.status(201).json({
      token: createToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: createToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) { next(error); }
});

export default router;