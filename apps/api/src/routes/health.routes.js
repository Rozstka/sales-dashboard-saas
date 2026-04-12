import { Router } from "express";
import { query } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/", async (req, res, next) => {
  try {
    await query("SELECT 1");
    return res.json({ status: "ok", db: "connected" });
  } catch (error) {
    return next(error);
  }
});
