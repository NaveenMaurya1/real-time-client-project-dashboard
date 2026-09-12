import { getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead, } from "../services/notification.service.js";
export const listNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
            });
        }
        const notifications = await getNotifications(req.user.userId);
        return res.json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        console.error("List notifications error:", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch notifications",
            },
        });
    }
};
export const unreadCount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
            });
        }
        const count = await getUnreadNotificationCount(req.user.userId);
        return res.json({
            success: true,
            data: {
                count,
            },
        });
    }
    catch (error) {
        console.error("Unread notification count error:", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch unread count",
            },
        });
    }
};
export const markAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
            });
        }
        const notificationId = Number(req.params.id);
        if (Number.isNaN(notificationId)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_ID",
                    message: "Invalid notification ID",
                },
            });
        }
        const notification = await markNotificationAsRead(notificationId, req.user.userId);
        return res.json({
            success: true,
            data: notification,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "Notification not found") {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Notification not found",
                },
            });
        }
        console.error("Mark notification read error:", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to mark notification as read",
            },
        });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
            });
        }
        const result = await markAllNotificationsAsRead(req.user.userId);
        return res.json({
            success: true,
            data: {
                updated: result.count,
            },
        });
    }
    catch (error) {
        console.error("Mark all notifications read error:", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to mark notifications as read",
            },
        });
    }
};
//# sourceMappingURL=notification.controller.js.map