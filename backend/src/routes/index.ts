import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { healthRoutes } from "./healthRoutes";

export const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use("/auth", authRoutes);
