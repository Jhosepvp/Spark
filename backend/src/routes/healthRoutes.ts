import { Router } from "express";
import { pool } from "../config/db";
import { redis } from "../config/redis";

export const healthRoutes = Router();

healthRoutes.get("/health", async (_req, res) => {
  const checks = { postgres: false, redis: false };

  try {
    await pool.query("SELECT 1");
    checks.postgres = true;
  } catch {
    checks.postgres = false;
  }

  try {
    checks.redis = redis.status === "ready";
  } catch {
    checks.redis = false;
  }

  const healthy = checks.postgres && checks.redis;
  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded", checks });
});
