import { redis } from "../config/redis";

const LOCAL_QUEUE_KEY = "spark:queue:local_1on1";

export interface QueueEntry {
  userId: string;
  socketId: string;
}

function serialize(entry: QueueEntry): string {
  return JSON.stringify(entry);
}

function deserialize(raw: string): QueueEntry {
  return JSON.parse(raw) as QueueEntry;
}

export async function enqueue1on1(entry: QueueEntry): Promise<void> {
  await redis.rpush(LOCAL_QUEUE_KEY, serialize(entry));
}

export async function leaveQueue(entry: QueueEntry): Promise<void> {
  await redis.lrem(LOCAL_QUEUE_KEY, 0, serialize(entry));
}

/**
 * Pops two waiting users off the queue to form a match.
 * NOTE: for a single Redis/server instance this is safe because ioredis
 * serializes commands on one connection. If this service is scaled
 * horizontally, replace this with a Lua script (EVAL) so the two LPOPs
 * happen atomically.
 */
export async function tryMatch1on1(): Promise<[QueueEntry, QueueEntry] | null> {
  const length = await redis.llen(LOCAL_QUEUE_KEY);
  if (length < 2) return null;

  const [rawA, rawB] = await Promise.all([
    redis.lpop(LOCAL_QUEUE_KEY),
    redis.lpop(LOCAL_QUEUE_KEY),
  ]);

  if (!rawA || !rawB) {
    // Not enough entries were actually available; push back whichever we got.
    if (rawA) await redis.lpush(LOCAL_QUEUE_KEY, rawA);
    if (rawB) await redis.lpush(LOCAL_QUEUE_KEY, rawB);
    return null;
  }

  return [deserialize(rawA), deserialize(rawB)];
}
