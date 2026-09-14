import {
  Priority,
  Prisma,
  TaskStatus,
} from "@prisma/client";

import { prisma } from "../config/database.js";
import { getIO } from "../sockets/socket.js";

interface TaskFilters {
  status?: string;
  priority?: string;
  from?: string;
  to?: string;
}

const isTaskStatus = (value: string): value is TaskStatus => {
  return Object.values(TaskStatus).includes(value as TaskStatus);
};

const isPriority = (value: string): value is Priority => {
  return Object.values(Priority).includes(value as Priority);
};

export const getTasks = async (
  userId: number,
  role: string,
  filters: TaskFilters
) => {
  const where: Prisma.TaskWhereInput = {};

  // Developer can only see tasks assigned to themselves
  if (role === "DEVELOPER") {
    where.assignedDeveloperId = userId;
  }

  // Project Manager can only see tasks
  // belonging to projects they created
  if (role === "PROJECT_MANAGER") {
    where.project = {
      createdById: userId,
    };
  }

  // Status filter
  if (filters.status) {
    if (!isTaskStatus(filters.status)) {
      throw new Error("Invalid task status");
    }

    where.status = filters.status;
  }

  // Priority filter
  if (filters.priority) {
    if (!isPriority(filters.priority)) {
      throw new Error("Invalid priority");
    }

    where.priority = filters.priority;
  }

  // Due date filter
  if (filters.from || filters.to) {
    const dueDateFilter: Prisma.DateTimeFilter = {};

    if (filters.from) {
      const fromDate = new Date(filters.from);

      if (Number.isNaN(fromDate.getTime())) {
        throw new Error("Invalid from date");
      }

      dueDateFilter.gte = fromDate;
    }

    if (filters.to) {
      const toDate = new Date(filters.to);

      if (Number.isNaN(toDate.getTime())) {
        throw new Error("Invalid to date");
      }

      dueDateFilter.lte = toDate;
    }

    where.dueDate = dueDateFilter;
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

  // Critical > High > Medium > Low
  const priorityOrder: Record<Priority, number> = {
    [Priority.CRITICAL]: 1,
    [Priority.HIGH]: 2,
    [Priority.MEDIUM]: 3,
    [Priority.LOW]: 4,
  };

  tasks.sort((a, b) => {
    const priorityDifference =
      priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return (
      new Date(a.dueDate).getTime() -
      new Date(b.dueDate).getTime()
    );
  });

  return tasks;
};

export const getTaskById = async (
  taskId: number,
  userId: number,
  role: string
) => {
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

  // Admin can access everything
  if (role === "ADMIN") {
    return task;
  }

  // PM can access tasks from projects they created
  if (role === "PROJECT_MANAGER") {
    if (task.project.createdById !== userId) {
      throw new Error("You do not have access to this task");
    }

    return task;
  }

  // Developer can only access assigned tasks
  if (role === "DEVELOPER") {
    if (task.assignedDeveloperId !== userId) {
      throw new Error("You do not have access to this task");
    }

    return task;
  }

  throw new Error("You do not have access to this task");
};

export const createTask = async (
  projectId: number,
  userId: number,
  role: string,
  data: {
    title: string;
    description?: string;
    assignedDeveloperId: number;
    priority: string;
    dueDate: string;
  }
) => {
  // Check project
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // PM can only create tasks in their own projects
  if (
    role === "PROJECT_MANAGER" &&
    project.createdById !== userId
  ) {
    throw new Error("You do not have access to this project");
  }

  // Developers cannot create tasks
  if (role === "DEVELOPER") {
    throw new Error("Developers cannot create tasks");
  }

  // Check assigned developer
  const developer = await prisma.user.findUnique({
    where: {
      id: data.assignedDeveloperId,
    },
  });

  if (!developer || developer.role !== "DEVELOPER") {
    throw new Error("Assigned user is not a developer");
  }

  // Validate priority
  if (!isPriority(data.priority)) {
    throw new Error("Invalid priority");
  }

  // Keep the validated enum value
  // so Prisma receives Priority instead of string.
  const priority: Priority = data.priority;

  // Validate due date
  const dueDate = new Date(data.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    throw new Error("Invalid due date");
  }

  /*
   * Create task and notification in the same
   * database transaction.
   */
  const result = await prisma.$transaction(async (tx) => {
    // Create task
    const task = await tx.task.create({
      data: {
        projectId,
        title: data.title,

        ...(data.description !== undefined && {
          description: data.description,
        }),

        assignedDeveloperId: data.assignedDeveloperId,

        priority,

        dueDate,

        status: TaskStatus.TODO,
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

    // Create notification for assigned developer
    const notification = await tx.notification.create({
      data: {
        userId: data.assignedDeveloperId,
        taskId: task.id,
        projectId: project.id,
        message: `You have been assigned Task #${task.id}: ${task.title}`,
      },
    });

    return {
      task,
      notification,
    };
  });

  /*
   * Send real-time notification to the assigned developer.
   */
  const io = getIO();

  io.to(`developer:${data.assignedDeveloperId}`).emit(
    "notification:new",
    {
      id: result.notification.id,
      userId: result.notification.userId,
      taskId: result.notification.taskId,
      projectId: result.notification.projectId,
      message: result.notification.message,
      read: result.notification.read,
      createdAt: result.notification.createdAt,
    }
  );

  return result.task;
};

export const updateTask = async (
  taskId: number,
  userId: number,
  role: string,
  data: {
    title?: string;
    description?: string;
    assignedDeveloperId?: number;
    priority?: string;
    dueDate?: string;
  }
) => {
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

  // Only Admin or the PM who owns the project
  // can update the task
  if (
    role !== "ADMIN" &&
    task.project.createdById !== userId
  ) {
    throw new Error("You do not have access to this task");
  }

  const updateData: Prisma.TaskUncheckedUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  // Validate developer if reassigned
  if (data.assignedDeveloperId !== undefined) {
    const developer = await prisma.user.findUnique({
      where: {
        id: data.assignedDeveloperId,
      },
    });

    if (!developer || developer.role !== "DEVELOPER") {
      throw new Error("Assigned user is not a developer");
    }

    updateData.assignedDeveloperId =
      data.assignedDeveloperId;
  }

  // Validate priority
  if (data.priority !== undefined) {
    if (!isPriority(data.priority)) {
      throw new Error("Invalid priority");
    }

    const priority: Priority = data.priority;

    updateData.priority = priority;
  }

  // Validate due date
  if (data.dueDate !== undefined) {
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

export const updateTaskStatus = async (
  taskId: number,
  userId: number,
  role: string,
  newStatus: string
) => {
  // OVERDUE must only be set by the background job
  if (
    !isTaskStatus(newStatus) ||
    newStatus === TaskStatus.OVERDUE
  ) {
    throw new Error("Invalid task status");
  }

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

  // Admin can update any task
  if (role === "ADMIN") {
    // Allowed
  }

  // PM can update tasks from their own projects
  else if (role === "PROJECT_MANAGER") {
    if (task.project.createdById !== userId) {
      throw new Error("You do not have access to this task");
    }
  }

  // Developer can only update assigned tasks
  else if (role === "DEVELOPER") {
    if (task.assignedDeveloperId !== userId) {
      throw new Error(
        "You can only update tasks assigned to you"
      );
    }
  }

  else {
    throw new Error("You do not have access to this task");
  }

  if (task.status === newStatus) {
    throw new Error("Task is already in this status");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update task status
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

    // Create activity log
    const activity = await tx.activityLog.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        userId,

        fromStatus: task.status,
        toStatus: newStatus,
      },
    });

    let notification = null;

    // Notify PM when task moves to IN_REVIEW
    if (
      newStatus === TaskStatus.IN_REVIEW &&
      task.project.createdById !== userId
    ) {
      notification = await tx.notification.create({
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

  // Admin activity room
  io.to("global:admins").emit(
    "activity:new",
    activityPayload
  );

  // Project manager activity room
  io.to(`pm:${task.project.createdById}`).emit(
    "activity:new",
    activityPayload
  );

  // Developer activity room
  io.to(`developer:${task.assignedDeveloperId}`).emit(
    "activity:new",
    activityPayload
  );

  // Notification for PM
  if (result.notification) {
    io.to(`pm:${task.project.createdById}`).emit(
      "notification:new",
      {
        id: result.notification.id,
        userId: result.notification.userId,
        taskId: result.notification.taskId,
        projectId: result.notification.projectId,
        message: result.notification.message,
        read: result.notification.read,
        createdAt: result.notification.createdAt,
      }
    );
  }

  return result;
};