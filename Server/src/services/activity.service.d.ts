export declare const getRecentActivities: (userId: number, role: string) => Promise<({
    project: {
        id: number;
        name: string;
    };
    task: {
        id: number;
        title: string;
    };
    user: {
        id: number;
        name: string;
        role: import("@prisma/client").$Enums.Role;
    };
} & {
    id: number;
    taskId: number;
    projectId: number;
    userId: number;
    fromStatus: import("@prisma/client").$Enums.TaskStatus | null;
    toStatus: import("@prisma/client").$Enums.TaskStatus;
    createdAt: Date;
})[]>;
//# sourceMappingURL=activity.service.d.ts.map