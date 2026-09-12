import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const listTasks: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=task.controller.d.ts.map