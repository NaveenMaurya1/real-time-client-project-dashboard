export declare const getAdminDashboard: () => Promise<{
    totalProjects: number;
    totalTasks: number;
    tasksByStatus: {
        TODO: number;
        IN_PROGRESS: number;
        IN_REVIEW: number;
        DONE: number;
    };
    overdueTasks: number;
}>;
export declare const getProjectManagerDashboard: (userId: number) => Promise<{
    totalProjects: number;
    totalTasks: number;
    tasksByPriority: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        CRITICAL: number;
    };
    dueThisWeek: number;
    overdueTasks: number;
}>;
export declare const getDeveloperDashboard: (userId: number) => Promise<{
    totalAssigned: number;
    tasksByStatus: {
        TODO: number;
        IN_PROGRESS: number;
        IN_REVIEW: number;
        DONE: number;
    };
    tasksByPriority: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        CRITICAL: number;
    };
    overdueTasks: number;
}>;
//# sourceMappingURL=dashboard.service.d.ts.map