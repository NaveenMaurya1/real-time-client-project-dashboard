import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

// userId -> active socket IDs
const onlineUsers = new Map<number, Set<string>>();

export const initializeSocket = (
  socketServer: SocketIOServer
) => {
  io = socketServer;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

// Add a socket for a user
export const addOnlineUser = (
  userId: number,
  socketId: string
) => {
  let sockets = onlineUsers.get(userId);

  if (!sockets) {
    sockets = new Set<string>();
    onlineUsers.set(userId, sockets);
  }

  sockets.add(socketId);
};

// Remove a socket for a user
export const removeOnlineUser = (
  userId: number,
  socketId: string
) => {
  const sockets = onlineUsers.get(userId);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }
};

// Get number of unique online users
export const getOnlineUserCount = (): number => {
  return onlineUsers.size;
};