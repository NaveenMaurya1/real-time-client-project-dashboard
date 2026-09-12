let io = null;
// userId -> active socket IDs
const onlineUsers = new Map();
export const initializeSocket = (socketServer) => {
    io = socketServer;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }
    return io;
};
// Add a socket for a user
export const addOnlineUser = (userId, socketId) => {
    let sockets = onlineUsers.get(userId);
    if (!sockets) {
        sockets = new Set();
        onlineUsers.set(userId, sockets);
    }
    sockets.add(socketId);
};
// Remove a socket for a user
export const removeOnlineUser = (userId, socketId) => {
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
export const getOnlineUserCount = () => {
    return onlineUsers.size;
};
//# sourceMappingURL=socket.js.map