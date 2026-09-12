interface TaskFilters {
    status?: string;
    priority?: string;
    from?: string;
    to?: string;
}
export declare const getTasks: (userId: number, role: string, filters: TaskFilters) => Promise<({
    developer: {
        email: string;
        id: number;
        name: string;
    };
    project: {
        createdById: number;
        id: number;
        name: string;
    };
} & {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    assignedDeveloperId: number;
    status: import("@prisma/client").$Enums.TaskStatus;
    priority: import("@prisma/client").$Enums.Priority;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getTaskById: (taskId: number, userId: number, role: string) => Promise<{
    activities: {
        id: number;
        taskId: number;
        projectId: number;
        userId: number;
        fromStatus: import("@prisma/client").$Enums.TaskStatus | null;
        toStatus: import("@prisma/client").$Enums.TaskStatus;
        createdAt: Date;
    }[];
    developer: {
        email: string;
        id: number;
        name: string;
    };
    project: {
        id: number;
        name: string;
        description: string | null;
        clientId: number;
        createdById: number;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    assignedDeveloperId: number;
    status: import("@prisma/client").$Enums.TaskStatus;
    priority: import("@prisma/client").$Enums.Priority;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createTask: (projectId: number, userId: number, role: string, data: {
    title: string;
    description?: string;
    assignedDeveloperId: number;
    priority: string;
    dueDate: string;
}) => Promise<{
    developer: {
        email: string;
        id: number;
        name: string;
    };
    project: {
        createdById: number;
        id: number;
        name: string;
    };
} & {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    assignedDeveloperId: number;
    status: import("@prisma/client").$Enums.TaskStatus;
    priority: import("@prisma/client").$Enums.Priority;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateTask: (taskId: number, userId: number, role: string, data: {
    title?: string;
    description?: string;
    assignedDeveloperId?: number;
    priority?: string;
    dueDate?: string;
}) => Promise<{
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    assignedDeveloperId: number;
    status: import("@prisma/client").$Enums.TaskStatus;
    priority: import("@prisma/client").$Enums.Priority;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateTaskStatus: (taskId: number, userId: number, role: string, newStatus: string) => Promise<{
    updatedTask: {
        developer: {
            email: string;
            id: number;
            name: string;
        };
        project: {
            createdById: number;
            id: number;
            name: string;
        };
    } & {
        id: number;
        projectId: number;
        title: string;
        description: string | null;
        assignedDeveloperId: number;
        status: import("@prisma/client").$Enums.TaskStatus;
        priority: import("@prisma/client").$Enums.Priority;
        dueDate: Date;
        createdAt: Date;
        updatedAt: Date;
    };
    activity: {
        id: number;
        taskId: number;
        projectId: number;
        userId: number;
        fromStatus: import("@prisma/client").$Enums.TaskStatus | null;
        toStatus: import("@prisma/client").$Enums.TaskStatus;
        createdAt: Date;
    };
    notification: {
        id: number;
        userId: number;
        message: string;
        taskId: number | null;
        projectId: number | null;
        read: boolean;
        createdAt: Date;
    } | null;
}>;
export {};
//# sourceMappingURL=task.service.d.ts.map