import { Router } from "express";
import { getTask, listTasks, update, updateStatus, } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
const router = Router();
// All authenticated users can see their authorized tasks
router.get("/", authenticate, listTasks);
// All authenticated users can access a task
// but service-level authorization decides whether they can see it
router.get("/:id", authenticate, getTask);
// Only Admin and PM can edit task details
router.put("/:id", authenticate, requireRoles("ADMIN", "PROJECT_MANAGER"), update);
router.patch("/:id/status", authenticate, updateStatus);
export default router;
//# sourceMappingURL=task.routes.js.map