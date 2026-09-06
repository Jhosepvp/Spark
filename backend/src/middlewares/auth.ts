import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./errorHandler";

export interface JwtPayload {
  id: string;
  username: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
