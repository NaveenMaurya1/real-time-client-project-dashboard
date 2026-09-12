import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is required",
        },
      });
    }

    const token = authHeader.split(" ")[1];
        if (!token) {
             return res.status(401).json({
               success: false,
               error: {
                 code: "INVALID_TOKEN",
                 message: "Access token is missing",
                },
            });
        }

    const payload = verifyAccessToken(token);
   

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired access token",
      },
    });
  }
};