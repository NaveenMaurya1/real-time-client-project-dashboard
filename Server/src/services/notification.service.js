import { prisma } from "../config/database.js";
export const getNotifications = async (userId) => {
    return prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });
};
export const getUnreadNotificationCount = async (userId) => {
    return prisma.notification.count({
        where: {
            userId,
            read: false,
        },
    });
};
export const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });
    if (!notification) {
        throw new Error("Notification not found");
    }
    return prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            read: true,
        },
    });
};
export const markAllNotificationsAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: {
            userId,
            read: false,
        },
        data: {
            read: true,
        },
    });
};
//# sourceMappingURL=notification.service.js.map