import type { Request, Response } from "express";
import { z } from "zod";
import { loginUser, registerUser } from "../services/authService";

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function register(req: Request, res: Response): Promise<void> {
  const { username, password } = credentialsSchema.parse(req.body);
  const result = await registerUser(username, password);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = credentialsSchema.parse(req.body);
  const result = await loginUser(username, password);
  res.status(200).json(result);
}
