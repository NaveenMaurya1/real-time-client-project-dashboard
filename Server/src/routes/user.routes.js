import { Router } from "express";
import { listDevelopers } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
const router = Router();
router.get("/developers", authenticate, requireRoles("ADMIN", "PROJECT_MANAGER"), listDevelopers);
export default router;
//# sourceMappingURL=user.routes.js.map