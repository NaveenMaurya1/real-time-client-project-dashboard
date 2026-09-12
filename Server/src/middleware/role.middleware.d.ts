import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";
export declare const requireRoles: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=role.middleware.d.ts.map