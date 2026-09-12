import type { Server as SocketIOServer } from "socket.io";
export declare const initializeSocket: (socketServer: SocketIOServer) => void;
export declare const getIO: () => SocketIOServer;
export declare const addOnlineUser: (userId: number, socketId: string) => void;
export declare const removeOnlineUser: (userId: number, socketId: string) => void;
export declare const getOnlineUserCount: () => number;
//# sourceMappingURL=socket.d.ts.map