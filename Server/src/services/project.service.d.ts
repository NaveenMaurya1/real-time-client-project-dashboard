export declare const getProjects: (userId: number, role: string) => Promise<({
    _count: {
        tasks: number;
    };
    client: {
        id: number;
        name: string;
        email: string;
        company: string;
        createdAt: Date;
    };
    createdBy: {
        email: string;
        id: number;
        name: string;
    };
} & {
    id: number;
    name: string;
    description: string | null;
    clientId: number;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getProjectById: (projectId: number, userId: number, role: string) => Promise<{
    client: {
        id: number;
        name: string;
        email: string;
        company: string;
        createdAt: Date;
    };
    createdBy: {
        email: string;
        id: number;
        name: string;
    };
    tasks: ({
        developer: {
            email: string;
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
    })[];
} & {
    id: number;
    name: string;
    description: string | null;
    clientId: number;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createProject: (name: string, description: string | undefined, clientId: number, createdById: number) => Promise<{
    client: {
        id: number;
        name: string;
        email: string;
        company: string;
        createdAt: Date;
    };
} & {
    id: number;
    name: string;
    description: string | null;
    clientId: number;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateProject: (projectId: number, userId: number, role: string, data: {
    name?: string;
    description?: string;
    clientId?: number;
}) => Promise<{
    id: number;
    name: string;
    description: string | null;
    clientId: number;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteProject: (projectId: number, userId: number, role: string) => Promise<{
    id: number;
    name: string;
    description: string | null;
    clientId: number;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=project.service.d.ts.map