import { prisma } from "../config/database.js";
export const listDevelopers = async (req, res) => {
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
        const developers = await prisma.user.findMany({
            where: {
                role: "DEVELOPER",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        return res.json({
            success: true,
            data: {
                developers,
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to fetch developers",
            },
        });
    }
};
//# sourceMappingURL=user.controller.js.map