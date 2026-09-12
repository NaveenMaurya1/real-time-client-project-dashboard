import { prisma } from "../config/database.js";
const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    // Monday = 1
    const difference = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + difference);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
        start,
        end,
    };
};
export const getAdminDashboard = async () => {
    const [totalProjects, totalTasks, todo, inProgress, inReview, done, overdue,] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.count({
            where: {
                status: "TODO",
            },
        }),
        prisma.task.count({
            where: {
                status: "IN_PROGRESS",
            },
        }),
        prisma.task.count({
            where: {
                status: "IN_REVIEW",
            },
        }),
        prisma.task.count({
            where: {
                status: "DONE",
            },
        }),
        prisma.task.count({
            where: {
                dueDate: {
                    lt: new Date(),
                },
                status: {
                    not: "DONE",
                },
            },
        }),
    ]);
    return {
        totalProjects,
        totalTasks,
        tasksByStatus: {
            TODO: todo,
            IN_PROGRESS: inProgress,
            IN_REVIEW: inReview,
            DONE: done,
        },
        overdueTasks: overdue,
    };
};
export const getProjectManagerDashboard = async (userId) => {
    const { start, end } = getWeekRange();
    const projectFilter = {
        createdById: userId,
    };
    const [totalProjects, totalTasks, low, medium, high, critical, dueThisWeek, overdue,] = await Promise.all([
        prisma.project.count({
            where: projectFilter,
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
            },
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
                priority: "LOW",
            },
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
                priority: "MEDIUM",
            },
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
                priority: "HIGH",
            },
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
                priority: "CRITICAL",
            },
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
                dueDate: {
                    gte: start,
                    lt: end,
                },
                status: {
                    not: "DONE",
                },
            },
        }),
        prisma.task.count({
            where: {
                project: projectFilter,
                dueDate: {
                    lt: new Date(),
                },
                status: {
                    not: "DONE",
                },
            },
        }),
    ]);
    return {
        totalProjects,
        totalTasks,
        tasksByPriority: {
            LOW: low,
            MEDIUM: medium,
            HIGH: high,
            CRITICAL: critical,
        },
        dueThisWeek,
        overdueTasks: overdue,
    };
};
export const getDeveloperDashboard = async (userId) => {
    const [totalAssigned, todo, inProgress, inReview, done, low, medium, high, critical, overdue,] = await Promise.all([
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                status: "TODO",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                status: "IN_PROGRESS",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                status: "IN_REVIEW",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                status: "DONE",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                priority: "LOW",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                priority: "MEDIUM",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                priority: "HIGH",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                priority: "CRITICAL",
            },
        }),
        prisma.task.count({
            where: {
                assignedDeveloperId: userId,
                dueDate: {
                    lt: new Date(),
                },
                status: {
                    not: "DONE",
                },
            },
        }),
    ]);
    return {
        totalAssigned,
        tasksByStatus: {
            TODO: todo,
            IN_PROGRESS: inProgress,
            IN_REVIEW: inReview,
            DONE: done,
        },
        tasksByPriority: {
            LOW: low,
            MEDIUM: medium,
            HIGH: high,
            CRITICAL: critical,
        },
        overdueTasks: overdue,
    };
};
//# sourceMappingURL=dashboard.service.js.map