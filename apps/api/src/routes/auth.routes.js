import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db.js";
import { seedDemoLeadsForUser } from "../services/demo-leads.js";
import { signToken } from "../services/jwt.js";

export const authRouter = Router();

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(120)
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(120)
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      input.email
    ]);

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const createdUser = await query(
      `
      INSERT INTO users (full_name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, full_name, email, role
      `,
      [input.fullName, input.email, passwordHash]
    );

    const user = createdUser.rows[0];
    await seedDemoLeadsForUser(user.id);
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const userResult = await query(
      "SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1",
      [input.email]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    const passwordValid = await bcrypt.compare(input.password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
});
