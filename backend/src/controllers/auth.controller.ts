import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  verifyToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { sendInviteEmail } from "../lib/resend";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // 1. Generate short-lived Access Token (15m) and long-lived Refresh Token (7d)
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    // 2. Set Refresh Token in secure httpOnly cookie
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/v1/auth/refresh
 * Validates the httpOnly Refresh Token cookie and issues a fresh 15-minute Access Token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      res.status(401).json({ error: "Refresh token missing. Please log in again." });
      return;
    }

    // 1. Verify Refresh Token signature
    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch (e) {
      res.status(401).json({ error: "Invalid or expired refresh token. Please log in again." });
      return;
    }

    if (!payload || !payload.userId) {
      res.status(401).json({ error: "Invalid refresh token payload" });
      return;
    }

    // 2. Ensure user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }

    // 3. Issue rotated tokens
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    // 4. Update httpOnly cookie with rotated refresh token
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      accessToken: newAccessToken,
      token: newAccessToken,
      user,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

/**
 * POST /api/v1/auth/logout
 * Clears the secure httpOnly Refresh Token cookie
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const invite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "User already exists with this email" });
      return;
    }

    // Create user with a dummy password hash (they will set it later)
    const dummyHash = await bcrypt.hash(Math.random().toString(36), 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash: dummyHash,
      },
    });

    // Generate an invite token valid for 24 hours
    const inviteToken = generateToken({ userId: user.id, role: user.role });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteLink = `${frontendUrl}/set-password?token=${inviteToken}`;

    console.log(`\n==================================================`);
    console.log(`✉️  [INVITATION CREATED for ${user.email}]`);
    console.log(`👉 Activation Link: ${inviteLink}`);
    console.log(`==================================================\n`);

    // Send the email via Resend (best-effort)
    const emailResult = await sendInviteEmail(user.email, inviteToken);

    res.status(201).json({
      message: emailResult.success
        ? "Invitation email sent successfully."
        : "User created! (Email delivery restricted on free tier — use activation link below)",
      inviteLink,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Verify token
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: hashedPassword },
    });

    res.status(200).json({
      message: "Password set successfully. You can now log in.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Set Password Error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
