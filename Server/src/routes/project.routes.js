import { Router } from "express";
import { getProject, listProjects, remove, update, } from "../controllers/project.controller.js";
import { create as createTask } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";
const router = Router();
router.get("/", authenticate, listProjects);
// Create a task inside a project
router.post("/:projectId/tasks", authenticate, requireRoles("ADMIN", "PROJECT_MANAGER"), createTask);
router.get("/:id", authenticate, getProject);
router.put("/:id", authenticate, requireRoles("ADMIN", "PROJECT_MANAGER"), update);
router.delete("/:id", authenticate, requireRoles("ADMIN", "PROJECT_MANAGER"), remove);
export default router;
//# sourceMappingURL=project.routes.js.map