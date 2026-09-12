import { createProject, deleteProject, getProjectById, getProjects, updateProject, } from "../services/project.service.js";
export const listProjects = async (req, res) => {
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
        const projects = await getProjects(req.user.userId, req.user.role);
        return res.json({
            success: true,
            data: {
                projects,
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to fetch projects",
            },
        });
    }
};
export const getProject = async (req, res) => {
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
        if (Number.isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_PROJECT_ID",
                    message: "Invalid project ID",
                },
            });
        }
        const project = await getProjectById(projectId, req.user.userId, req.user.role);
        return res.json({
            success: true,
            data: {
                project,
            },
        });
    }
    catch (error) {
        if (error.message === "Project not found") {
            return res.status(404).json({
                success: false,
                error: {
                    code: "PROJECT_NOT_FOUND",
                    message: error.message,
                },
            });
        }
        if (error.message.includes("do not have access")) {
            return res.status(403).json({
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: error.message,
                },
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to fetch project",
            },
        });
    }
};
export const create = async (req, res) => {
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
        const { name, description, clientId, } = req.body;
        if (!name || !clientId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Name and clientId are required",
                },
            });
        }
        const project = await createProject(name, description, Number(clientId), req.user.userId);
        return res.status(201).json({
            success: true,
            data: {
                project,
            },
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "CREATE_PROJECT_FAILED",
                message: error.message,
            },
        });
    }
};
export const update = async (req, res) => {
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
        const project = await updateProject(projectId, req.user.userId, req.user.role, req.body);
        return res.json({
            success: true,
            data: {
                project,
            },
        });
    }
    catch (error) {
        if (error.message === "Project not found") {
            return res.status(404).json({
                success: false,
                error: {
                    code: "PROJECT_NOT_FOUND",
                    message: error.message,
                },
            });
        }
        if (error.message.includes("do not have access")) {
            return res.status(403).json({
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: error.message,
                },
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to update project",
            },
        });
    }
};
export const remove = async (req, res) => {
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
        await deleteProject(projectId, req.user.userId, req.user.role);
        return res.json({
            success: true,
            message: "Project deleted successfully",
        });
    }
    catch (error) {
        if (error.message === "Project not found") {
            return res.status(404).json({
                success: false,
                error: {
                    code: "PROJECT_NOT_FOUND",
                    message: error.message,
                },
            });
        }
        if (error.message.includes("do not have access")) {
            return res.status(403).json({
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: error.message,
                },
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to delete project",
            },
        });
    }
};
//# sourceMappingURL=project.controller.js.map