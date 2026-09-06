import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { socketAuthMiddleware } from "./socketAuth";
import { registerChatHandlers } from "./chatHandlers";

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const { user } = socket.data as { user: { id: string; username: string } };
    console.log(`[socket] connected: ${user.username} (${socket.id})`);

    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${user.username} (${socket.id}) - ${reason}`);
    });
  });

  return io;
}
