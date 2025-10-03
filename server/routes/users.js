import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import generateToken from "../utils/generateToken.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
      if (!email || !password) { return res.status(400).json({ message: 'Email and password are required.' }); }

    const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) { return res.status(400).json({ message: 'Email already registered' }); }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { email, password: hashedPassword }, });
      return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
      if (!email || !password) { return res.status(400).json({ message: 'Email and password are required.' }); }

    const user = await prisma.user.findUnique({ where: { email } });
      if (!user) { return res.status(401).json({ message: 'Invalid email or password' }); }

    const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) { return res.status(401).json({ message: 'Invalid email or password' }); }

    const { accessToken, refreshToken } = generateToken(user.id, email);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // HTTPs only
      sameSite: "strict",
      maxAge: 14 * 24 * 60 * 60 * 1000,
  });

    return res.json({ accessToken });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// ------------------- REFRESH TOKEN -------------------
router.post("/refresh", async (req, res) => {
 try {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const decoded = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return reject(err);
        resolve (user);
      });
    });

    const { accessToken, refreshToken: newRefreshToken } = generateToken(decoded.userId);

    // Update refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: accessToken });
  } catch (error) {
      console.error('Refresh', error);
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// ------------------- LOGOUT -------------------
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});


export default router;