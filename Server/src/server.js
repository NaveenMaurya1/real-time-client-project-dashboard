import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { initializeSocket, addOnlineUser, removeOnlineUser, getOnlineUserCount, } from "./sockets/socket.js";
import { verifyAccessToken } from "./utils/jwt.js";
import activityRoutes from "./routes/activity.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { startOverdueTasksJob } from "./jobs/overdueTasks.job.js";
import clientRoutes from "./routes/client.routes.js";
import userRoutes from "./routes/user.routes.js";
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});
initializeSocket(io);
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }
        const payload = verifyAccessToken(token);
        socket.data.userId = payload.userId;
        socket.data.role = payload.role;
        next();
    }
    catch {
        next(new Error("Invalid or expired access token"));
    }
});
io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;
    console.log(`Socket connected: ${socket.id}, user ${userId}, role ${role}`);
    // Track online user
    addOnlineUser(userId, socket.id);
    // Role-based rooms
    if (role === "ADMIN") {
        socket.join("global:admins");
        // Send current online count to this admin
        socket.emit("presence:count", getOnlineUserCount());
    }
    if (role === "PROJECT_MANAGER") {
        socket.join(`pm:${userId}`);
    }
    if (role === "DEVELOPER") {
        socket.join(`developer:${userId}`);
    }
    // Broadcast updated count to all admins
    io.to("global:admins").emit("presence:count", getOnlineUserCount());
    socket.on("disconnect", () => {
        removeOnlineUser(userId, socket.id);
        console.log(`Socket disconnected: ${socket.id}, user ${userId}`);
        // Send updated count to admins
        io.to("global:admins").emit("presence:count", getOnlineUserCount());
    });
});
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Client Project Dashboard API is running",
    });
});
app.get("/health/db", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            success: true,
            message: "Database connected successfully",
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
startOverdueTasksJob();
const PORT = Number(process.env.PORT) || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map