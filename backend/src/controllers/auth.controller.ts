import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { generateToken, verifyToken } from "../lib/jwt";
import { sendInviteEmail } from "../lib/resend";

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

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
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

    // Send the email via Resend
    const emailResult = await sendInviteEmail(user.email, inviteToken);

    if (!emailResult.success) {
      res.status(500).json({ error: "Failed to send invitation email", details: emailResult.error });
      return;
    }

    res.status(201).json({ message: "Invitation sent successfully", user: { id: user.id, email: user.email } });
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
