import { prisma } from "../config/database.js";
import { getIO } from "../sockets/socket.js";
export const getTasks = async (userId, role, filters) => {
    const where = {};
    /*
     * DEVELOPER:
     * Can only see tasks assigned to them.
     */
    if (role === "DEVELOPER") {
        where.assignedDeveloperId = userId;
    }
    /*
     * PROJECT MANAGER:
     * Can only see tasks from their own projects.
     */
    if (role === "PROJECT_MANAGER") {
        where.project = {
            createdById: userId,
        };
    }
    /*
     * ADMIN:
     * No additional filter.
     * Admin can see all tasks.
     */
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.priority) {
        where.priority = filters.priority;
    }
    if (filters.from || filters.to) {
        where.dueDate = {};
        if (filters.from) {
            where.dueDate.gte = new Date(filters.from);
        }
        if (filters.to) {
            where.dueDate.lte = new Date(filters.to);
        }
    }
    const tasks = await prisma.task.findMany({
        where,
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    createdById: true,
                },
            },
            developer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            dueDate: "asc",
        },
    });
    /*
     * Assignment requirement:
     * Developer tasks should be sorted by:
     *
     * 1. Priority
     * 2. Due date
     */
    const priorityOrder = {
        CRITICAL: 1,
        HIGH: 2,
        MEDIUM: 3,
        LOW: 4,
    };
    tasks.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] ?? 999;
        const priorityB = priorityOrder[b.priority] ?? 999;
        const priorityDifference = priorityA - priorityB;
        if (priorityDifference !== 0) {
            return priorityDifference;
        }
        return (new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime());
    });
    return tasks;
};
export const getTaskById = async (taskId, userId, role) => {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: true,
            developer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            activities: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    /*
     * ADMIN can access everything.
     */
    if (role === "ADMIN") {
        return task;
    }
    /*
     * PROJECT MANAGER can only access
     * tasks belonging to their projects.
     */
    if (role === "PROJECT_MANAGER") {
        if (task.project.createdById !== userId) {
            throw new Error("You do not have access to this task");
        }
        return task;
    }
    /*
     * DEVELOPER can only access
     * their assigned tasks.
     */
    if (role === "DEVELOPER") {
        if (task.assignedDeveloperId !== userId) {
            throw new Error("You do not have access to this task");
        }
        return task;
    }
    throw new Error("You do not have access to this task");
};
export const createTask = async (projectId, userId, role, data) => {
    /*
     * 1. Check project exists
     */
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    /*
     * 2. PM can only manage their own projects
     */
    if (role === "PROJECT_MANAGER" &&
        project.createdById !== userId) {
        throw new Error("You do not have access to this project");
    }
    /*
     * 3. Developers cannot create tasks
     */
    if (role === "DEVELOPER") {
        throw new Error("Developers cannot create tasks");
    }
    /*
     * 4. Check assigned developer exists
     */
    const developer = await prisma.user.findUnique({
        where: {
            id: data.assignedDeveloperId,
        },
    });
    if (!developer ||
        developer.role !== "DEVELOPER") {
        throw new Error("Assigned user is not a developer");
    }
    /*
     * 5. Validate priority
     */
    const validPriorities = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ];
    if (!validPriorities.includes(data.priority)) {
        throw new Error("Invalid priority");
    }
    /*
     * 6. Validate due date
     */
    const dueDate = new Date(data.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
        throw new Error("Invalid due date");
    }
    /*
     * 7. Create task
     */
    return prisma.task.create({
        data: {
            projectId,
            title: data.title,
            ...(data.description !== undefined && {
                description: data.description,
            }),
            assignedDeveloperId: data.assignedDeveloperId,
            priority: data.priority,
            dueDate,
            status: "TODO",
        },
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    createdById: true,
                },
            },
            developer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};
export const updateTask = async (taskId, userId, role, data) => {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: true,
        },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    /*
     * ADMIN can update any task.
     *
     * PROJECT MANAGER can only update
     * tasks belonging to their projects.
     *
     * DEVELOPER cannot use this endpoint
     * for general task editing.
     */
    if (role !== "ADMIN" &&
        task.project.createdById !== userId) {
        throw new Error("You do not have access to this task");
    }
    const updateData = {
        ...data,
    };
    if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        if (Number.isNaN(dueDate.getTime())) {
            throw new Error("Invalid due date");
        }
        updateData.dueDate = dueDate;
    }
    return prisma.task.update({
        where: {
            id: taskId,
        },
        data: updateData,
    });
};
export const updateTaskStatus = async (taskId, userId, role, newStatus) => {
    /*
     * Manual status changes.
     *
     * OVERDUE is intentionally excluded because
     * the background node-cron job should handle it.
     */
    const validStatuses = [
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "DONE",
    ];
    if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid task status");
    }
    /*
     * Find the task first.
     */
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: true,
            developer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    /*
     * ROLE-BASED AUTHORIZATION
     */
    if (role === "ADMIN") {
        /*
         * Admin can update any task.
         */
    }
    else if (role === "PROJECT_MANAGER") {
        /*
         * PM can update tasks only inside
         * projects created by that PM.
         */
        if (task.project.createdById !== userId) {
            throw new Error("You do not have access to this task");
        }
    }
    else if (role === "DEVELOPER") {
        /*
         * Developer can update only
         * tasks assigned to them.
         */
        if (task.assignedDeveloperId !== userId) {
            throw new Error("You can only update tasks assigned to you");
        }
    }
    else {
        throw new Error("You do not have access to this task");
    }
    /*
     * Don't create duplicate activity
     * if the status hasn't changed.
     */
    if (task.status === newStatus) {
        throw new Error("Task is already in this status");
    }
    /*
     * DATABASE TRANSACTION
     *
     * 1. Update task
     * 2. Create ActivityLog
     * 3. Create Notification when required
     *
     * Either everything succeeds or everything
     * rolls back.
     */
    const result = await prisma.$transaction(async (tx) => {
        /*
         * Update task status
         */
        const updatedTask = await tx.task.update({
            where: {
                id: taskId,
            },
            data: {
                status: newStatus,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        createdById: true,
                    },
                },
                developer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        /*
         * Create activity log
         */
        const activity = await tx.activityLog.create({
            data: {
                taskId: task.id,
                projectId: task.projectId,
                userId,
                fromStatus: task.status,
                toStatus: newStatus,
            },
        });
        /*
         * Notification
         *
         * If someone other than the PM moves
         * the task to IN_REVIEW, notify the PM.
         */
        let notification = null;
        if (newStatus === "IN_REVIEW" &&
            task.project.createdById !== userId) {
            notification =
                await tx.notification.create({
                    data: {
                        userId: task.project.createdById,
                        taskId: task.id,
                        projectId: task.projectId,
                        message: `${task.developer.name} moved Task #${task.id} to In Review`,
                    },
                });
        }
        return {
            updatedTask,
            activity,
            notification,
        };
    });
    /*
     * REAL-TIME ACTIVITY
     *
     * Get the Socket.IO server only after
     * the database transaction succeeds.
     */
    const io = getIO();
    const activityPayload = {
        id: result.activity.id,
        taskId: result.activity.taskId,
        projectId: result.activity.projectId,
        userId: result.activity.userId,
        fromStatus: result.activity.fromStatus,
        toStatus: result.activity.toStatus,
        createdAt: result.activity.createdAt,
    };
    /*
     * ADMIN ROOM
     *
     * All admins receive global activity.
     */
    io.to("global:admins").emit("activity:new", activityPayload);
    /*
     * PROJECT MANAGER ROOM
     *
     * Only the PM who owns this project
     * receives the activity.
     */
    io.to(`pm:${task.project.createdById}`).emit("activity:new", activityPayload);
    /*
     * DEVELOPER ROOM
     *
     * The developer assigned to this task
     * receives the activity.
     */
    io.to(`developer:${task.assignedDeveloperId}`).emit("activity:new", activityPayload);
    /*
     * REAL-TIME NOTIFICATION
     *
     * If a notification was created,
     * immediately send it to the PM.
     */
    if (result.notification) {
        io.to(`pm:${task.project.createdById}`).emit("notification:new", {
            id: result.notification.id,
            userId: result.notification.userId,
            taskId: result.notification.taskId,
            projectId: result.notification.projectId,
            message: result.notification.message,
            read: result.notification.read,
            createdAt: result.notification.createdAt,
        });
    }
    return result;
};
//# sourceMappingURL=task.service.js.map