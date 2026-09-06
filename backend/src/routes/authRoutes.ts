import { Router } from "express";
import { login, register } from "../controllers/authController";
import { asyncHandler } from "../middlewares/asyncHandler";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));
