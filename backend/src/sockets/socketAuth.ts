import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload } from "../middlewares/auth";

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const token =
    (socket.handshake.auth?.token as string | undefined) ??
    (socket.handshake.headers.authorization?.replace("Bearer ", "") as string | undefined);

  if (!token) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    socket.data.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
