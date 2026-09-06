import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (err) => console.error("[redis] error", err));

// Dedicated pub/sub clients (a client in subscribe mode can't run normal commands).
export const redisPub = redis.duplicate();
export const redisSub = redis.duplicate();
