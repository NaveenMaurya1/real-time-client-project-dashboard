import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
  createTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../services/task.service.js";

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
    console.error(error);

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

    if (Number.isNaN(taskId)) {
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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch task";

    if (message === "Task not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message,
        },
      });
    }

    if (message.includes("do not have access")) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message,
        },
      });
    }

    console.error(error);

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

    if (Number.isNaN(projectId)) {
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

    const task = await createTask(
      projectId,
      req.user.userId,
      req.user.role,
      {
        title,
        description,
        assignedDeveloperId: Number(
          assignedDeveloperId
        ),
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
  } catch (error: any) {
    if (
      error.message === "Project not found"
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: error.message,
        },
      });
    }

    if (
      error.message.includes(
        "do not have access"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: error.message,
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_TASK_FAILED",
        message: error.message,
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

    if (Number.isNaN(taskId)) {
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
     updateData.assignedDeveloperId = Number(assignedDeveloperId);
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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update task";

    if (message === "Task not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message,
        },
      });
    }

    if (message.includes("do not have access")) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message,
        },
      });
    }

    console.error(error);

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

    if (Number.isNaN(taskId)) {
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
  } catch (error: any) {
    console.error(
      "Failed to update task status:",
      error
    );

    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: error.message,
        },
      });
    }

    if (
      error.message.includes("access to this task") ||
      error.message.includes(
        "only update tasks assigned"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: error.message,
        },
      });
    }

    if (error.message === "Invalid task status") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "STATUS_UPDATE_FAILED",
        message: "Unable to update task status",
      },
    });
  }
};