import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { checkDbConnection } from "./config/db";
import { redis } from "./config/redis";
import { initSocketServer } from "./sockets";

async function bootstrap(): Promise<void> {
  await checkDbConnection();

  // ioredis connects eagerly; this just confirms it's ready before we accept traffic.
  if (redis.status !== "ready") {
    await new Promise<void>((resolve, reject) => {
      redis.once("ready", () => resolve());
      redis.once("error", reject);
    });
  }

  const app = createApp();
  const httpServer = createServer(app);

  initSocketServer(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[server] Spark backend listening on port ${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error("[bootstrap] failed to start server", err);
  process.exit(1);
});
