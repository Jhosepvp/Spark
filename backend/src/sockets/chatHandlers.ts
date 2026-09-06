import type { Server, Socket } from "socket.io";
import { enqueue1on1, leaveQueue, tryMatch1on1 } from "../services/matchmakingService";

const GLOBAL_ROOM = "global-chat";

interface AuthedSocket extends Socket {
  data: {
    user: { id: string; username: string };
  };
}

export function registerChatHandlers(io: Server, socket: Socket): void {
  const authedSocket = socket as AuthedSocket;
  const { user } = authedSocket.data;

  // --- 1-on-1 local matchmaking ---
  socket.on("matchmaking:join_1on1", async () => {
    await enqueue1on1({ userId: user.id, socketId: socket.id });

    const match = await tryMatch1on1();
    if (!match) return;

    const [a, b] = match;
    const roomId = `chat:${a.socketId}:${b.socketId}`;

    io.sockets.sockets.get(a.socketId)?.join(roomId);
    io.sockets.sockets.get(b.socketId)?.join(roomId);

    io.to(roomId).emit("matchmaking:matched", { roomId });
  });

  socket.on("matchmaking:leave_1on1", async () => {
    await leaveQueue({ userId: user.id, socketId: socket.id });
  });

  // --- Global chat room ---
  socket.on("global:join", () => {
    socket.join(GLOBAL_ROOM);
    socket.to(GLOBAL_ROOM).emit("global:user_joined", { username: user.username });
  });

  socket.on("global:message", (payload: { text: string }) => {
    io.to(GLOBAL_ROOM).emit("global:message", {
      username: user.username,
      text: payload.text,
      sentAt: new Date().toISOString(),
    });
  });

  // --- Generic room messaging (used by 1-on-1 and multichat rooms) ---
  socket.on("room:message", (payload: { roomId: string; text: string }) => {
    if (!socket.rooms.has(payload.roomId)) return;

    io.to(payload.roomId).emit("room:message", {
      roomId: payload.roomId,
      username: user.username,
      text: payload.text,
      sentAt: new Date().toISOString(),
    });
  });

  // --- Multichat rooms (5-10 people) ---
  // MVP: client is handed a roomId by a future room-allocation service
  // (Redis-backed, tracking current occupancy per room, 5-10 capacity).
  socket.on("multichat:join", (payload: { roomId: string }) => {
    socket.join(payload.roomId);
    socket.to(payload.roomId).emit("multichat:user_joined", { username: user.username });
  });

  socket.on("multichat:leave", (payload: { roomId: string }) => {
    socket.leave(payload.roomId);
    socket.to(payload.roomId).emit("multichat:user_left", { username: user.username });
  });

  socket.on("disconnect", async () => {
    await leaveQueue({ userId: user.id, socketId: socket.id });
  });
}
