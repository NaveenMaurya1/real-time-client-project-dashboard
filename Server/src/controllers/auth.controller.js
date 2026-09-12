import { getUserById, loginUser, logoutUser, refreshAccessToken, registerUser, } from "../services/auth.service.js";
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Name, email and password are required",
                },
            });
        }
        const user = await registerUser(name, email, password);
        return res.status(201).json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "REGISTER_FAILED",
                message: error.message,
            },
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Email and password are required",
                },
            });
        }
        const result = await loginUser({
            email,
            password,
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
            success: true,
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: "LOGIN_FAILED",
                message: error.message,
            },
        });
    }
};
export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "NO_REFRESH_TOKEN",
                    message: "Refresh token not found",
                },
            });
        }
        const result = await refreshAccessToken(refreshToken);
        return res.json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: "REFRESH_FAILED",
                message: error.message,
            },
        });
    }
};
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await logoutUser(refreshToken);
        }
        res.clearCookie("refreshToken");
        return res.json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: {
                code: "LOGOUT_FAILED",
                message: "Unable to logout",
            },
        });
    }
};
export const me = async (req, res) => {
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
        const user = await getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found",
                },
            });
        }
        return res.json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Unable to fetch user",
            },
        });
    }
};
//# sourceMappingURL=auth.controller.js.map