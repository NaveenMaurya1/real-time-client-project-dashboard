import { getAdminDashboard, getProjectManagerDashboard, getDeveloperDashboard, } from "../services/dashboard.service.js";
export const getDashboard = async (req, res) => {
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
        const { userId, role } = req.user;
        if (role === "ADMIN") {
            const data = await getAdminDashboard();
            return res.json({
                success: true,
                data,
            });
        }
        if (role === "PROJECT_MANAGER") {
            const data = await getProjectManagerDashboard(userId);
            return res.json({
                success: true,
                data,
            });
        }
        if (role === "DEVELOPER") {
            const data = await getDeveloperDashboard(userId);
            return res.json({
                success: true,
                data,
            });
        }
        return res.status(403).json({
            success: false,
            error: {
                code: "FORBIDDEN",
                message: "Invalid user role",
            },
        });
    }
    catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to load dashboard",
            },
        });
    }
};
//# sourceMappingURL=dashboard.controller.js.map