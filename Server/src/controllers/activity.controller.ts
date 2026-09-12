import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getRecentActivities } from "../services/activity.service.js";

export const getActivities = async (
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

    const activities = await getRecentActivities(
      req.user.userId,
      req.user.role
    );

    return res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch activities",
      },
    });
  }
};