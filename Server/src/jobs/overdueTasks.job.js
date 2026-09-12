import cron from "node-cron";
import { prisma } from "../config/database.js";
import { getIO } from "../sockets/socket.js";
export const startOverdueTasksJob = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const overdueTasks = await prisma.task.findMany({
                where: {
                    dueDate: {
                        lt: now,
                    },
                    status: {
                        notIn: ["DONE", "OVERDUE"],
                    },
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            createdById: true,
                        },
                    },
                    developer: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
            if (overdueTasks.length === 0) {
                return;
            }
            for (const task of overdueTasks) {
                const result = await prisma.$transaction(async (tx) => {
                    const updatedTask = await tx.task.update({
                        where: {
                            id: task.id,
                        },
                        data: {
                            status: "OVERDUE",
                        },
                    });
                    const activity = await tx.activityLog.create({
                        data: {
                            taskId: task.id,
                            projectId: task.projectId,
                            userId: task.project.createdById,
                            fromStatus: task.status,
                            toStatus: "OVERDUE",
                        },
                    });
                    return {
                        updatedTask,
                        activity,
                    };
                });
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
                io.to("global:admins").emit("activity:new", activityPayload);
                io.to(`pm:${task.project.createdById}`).emit("activity:new", activityPayload);
                io.to(`developer:${task.developer.id}`).emit("activity:new", activityPayload);
            }
            console.log(`${overdueTasks.length} task(s) marked as overdue`);
        }
        catch (error) {
            console.error("Overdue task job failed:", error);
        }
    });
    console.log("Overdue task background job started");
};
//# sourceMappingURL=overdueTasks.job.js.map