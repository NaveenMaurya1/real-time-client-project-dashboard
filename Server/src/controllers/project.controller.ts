import type { Response } from "express";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../services/project.service.js";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "";
};

export const listProjects = async (
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

    const projects = await getProjects(
      req.user.userId,
      req.user.role
    );

    return res.json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to fetch projects",
      },
    });
  }
};

export const getProject = async (
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

    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        },
      });
    }

    const project = await getProjectById(
      projectId,
      req.user.userId,
      req.user.role
    );

    return res.json({
      success: true,
      data: {
        project,
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

    console.error("Failed to fetch project:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to fetch project",
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

    const {
      name,
      description,
      clientId,
    } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name and clientId are required",
        },
      });
    }

    const parsedClientId = Number(clientId);

    if (
      !Number.isInteger(parsedClientId) ||
      parsedClientId <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CLIENT_ID",
          message: "Invalid client ID",
        },
      });
    }

    const project = await createProject(
      name,
      description,
      parsedClientId,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Failed to create project:", error);

    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_PROJECT_FAILED",
        message: "Failed to create project",
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

    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        },
      });
    }

    const project = await updateProject(
      projectId,
      req.user.userId,
      req.user.role,
      req.body
    );

    return res.json({
      success: true,
      data: {
        project,
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

    console.error("Failed to update project:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to update project",
      },
    });
  }
};

export const remove = async (
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

    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        },
      });
    }

    await deleteProject(
      projectId,
      req.user.userId,
      req.user.role
    );

    return res.json({
      success: true,
      message: "Project deleted successfully",
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

    console.error("Failed to delete project:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to delete project",
      },
    });
  }
};