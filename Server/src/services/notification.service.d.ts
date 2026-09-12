export declare const getNotifications: (userId: number) => Promise<{
    id: number;
    userId: number;
    message: string;
    taskId: number | null;
    projectId: number | null;
    read: boolean;
    createdAt: Date;
}[]>;
export declare const getUnreadNotificationCount: (userId: number) => Promise<number>;
export declare const markNotificationAsRead: (notificationId: number, userId: number) => Promise<{
    id: number;
    userId: number;
    message: string;
    taskId: number | null;
    projectId: number | null;
    read: boolean;
    createdAt: Date;
}>;
export declare const markAllNotificationsAsRead: (userId: number) => Promise<import("@prisma/client").Prisma.BatchPayload>;
//# sourceMappingURL=notification.service.d.ts.map