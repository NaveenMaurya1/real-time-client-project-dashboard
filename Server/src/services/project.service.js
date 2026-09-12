import { prisma } from "../config/database.js";
export const getProjects = async (userId, role) => {
    if (role === "ADMIN") {
        return prisma.project.findMany({
            include: {
                client: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    if (role === "PROJECT_MANAGER") {
        return prisma.project.findMany({
            where: {
                createdById: userId,
            },
            include: {
                client: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    return [];
};
export const getProjectById = async (projectId, userId, role) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            client: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tasks: {
                include: {
                    developer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    if (role !== "ADMIN" &&
        project.createdById !== userId) {
        throw new Error("You do not have access to this project");
    }
    return project;
};
export const createProject = async (name, description, clientId, createdById) => {
    const client = await prisma.client.findUnique({
        where: {
            id: clientId,
        },
    });
    if (!client) {
        throw new Error("Client not found");
    }
    return prisma.project.create({
        data: {
            name,
            ...(description !== undefined && { description }),
            clientId,
            createdById,
        },
        include: {
            client: true,
        },
    });
};
export const updateProject = async (projectId, userId, role, data) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    if (role !== "ADMIN" &&
        project.createdById !== userId) {
        throw new Error("You do not have access to this project");
    }
    return prisma.project.update({
        where: {
            id: projectId,
        },
        data,
    });
};
export const deleteProject = async (projectId, userId, role) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    if (role !== "ADMIN" &&
        project.createdById !== userId) {
        throw new Error("You do not have access to this project");
    }
    return prisma.project.delete({
        where: {
            id: projectId,
        },
    });
};
//# sourceMappingURL=project.service.js.map