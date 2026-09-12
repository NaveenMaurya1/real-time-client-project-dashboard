import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const listNotifications: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const unreadCount: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAsRead: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAllAsRead: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notification.controller.d.ts.map