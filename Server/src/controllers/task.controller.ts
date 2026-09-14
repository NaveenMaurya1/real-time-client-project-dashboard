import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
  createTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../services/task.service.js";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "";
};

export const listTasks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const filters: {
      status?: string;
      priority?: string;
      from?: string;
      to?: string;
    } = {};

    if (typeof req.query.status === "string") {
      filters.status = req.query.status;
    }

    if (typeof req.query.priority === "string") {
      filters.priority = req.query.priority;
    }

    if (typeof req.query.from === "string") {
      filters.from = req.query.from;
    }

    if (typeof req.query.to === "string") {
      filters.to = req.query.to;
    }

    const tasks = await getTasks(
      req.user.userId,
      req.user.role,
      filters
    );

    return res.json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "TASK_LIST_FAILED",
        message: "Failed to fetch tasks",
      },
    });
  }
};

export const getTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TASK_ID",
          message: "Invalid task ID",
        },
      });
    }

    const task = await getTaskById(
      taskId,
      req.user.userId,
      req.user.role
    );

    return res.json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "Task not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: "Task not found",
        },
      });
    }

    if (message.includes("do not have access")) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this task",
        },
      });
    }

    console.error("Failed to fetch task:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "TASK_FETCH_FAILED",
        message: "Failed to fetch task",
      },
    });
  }
};

export const create = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const projectId = Number(req.params.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        },
      });
    }

    const {
      title,
      description,
      assignedDeveloperId,
      priority,
      dueDate,
    } = req.body;

    if (
      !title ||
      !assignedDeveloperId ||
      !priority ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "title, assignedDeveloperId, priority and dueDate are required",
        },
      });
    }

    const developerId = Number(assignedDeveloperId);

    if (!Number.isInteger(developerId) || developerId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DEVELOPER_ID",
          message: "Invalid developer ID",
        },
      });
    }

    const task = await createTask(
      projectId,
      req.user.userId,
      req.user.role,
      {
        title,
        description,
        assignedDeveloperId: developerId,
        priority,
        dueDate,
      }
    );

    return res.status(201).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "Project not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found",
        },
      });
    }

    if (message.includes("do not have access")) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this project",
        },
      });
    }

    console.error("Failed to create task:", error);

    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_TASK_FAILED",
        message: "Failed to create task",
      },
    });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TASK_ID",
          message: "Invalid task ID",
        },
      });
    }

    const {
      title,
      description,
      assignedDeveloperId,
      priority,
      dueDate,
    } = req.body;

    const updateData: {
      title?: string;
      description?: string;
      assignedDeveloperId?: number;
      priority?: string;
      dueDate?: string;
    } = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (assignedDeveloperId !== undefined) {
      const developerId = Number(assignedDeveloperId);

      if (!Number.isInteger(developerId) || developerId <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_DEVELOPER_ID",
            message: "Invalid developer ID",
          },
        });
      }

      updateData.assignedDeveloperId = developerId;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate;
    }

    const task = await updateTask(
      taskId,
      req.user.userId,
      req.user.role,
      updateData
    );

    return res.json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "Task not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: "Task not found",
        },
      });
    }

    if (message.includes("do not have access")) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to this task",
        },
      });
    }

    console.error("Failed to update task:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "TASK_UPDATE_FAILED",
        message: "Failed to update task",
      },
    });
  }
};

export const updateStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TASK_ID",
          message: "Invalid task ID",
        },
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Status is required",
        },
      });
    }

    const result = await updateTaskStatus(
      taskId,
      req.user.userId,
      req.user.role,
      status
    );

    return res.json({
      success: true,
      data: {
        updatedTask: result.updatedTask,
        activity: result.activity,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "Task not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: "Task not found",
        },
      });
    }

    if (
      message.includes("access to this task") ||
      message.includes("only update tasks assigned")
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this task",
        },
      });
    }

    if (message === "Invalid task status") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Invalid task status",
        },
      });
    }

    console.error("Failed to update task status:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "STATUS_UPDATE_FAILED",
        message: "Unable to update task status",
      },
    });
  }
};