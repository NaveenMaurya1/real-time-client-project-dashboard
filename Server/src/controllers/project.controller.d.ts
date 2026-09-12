import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const listProjects: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProject: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=project.controller.d.ts.map