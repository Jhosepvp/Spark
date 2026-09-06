import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
