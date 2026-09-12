import { Router } from "express";
import { getActivities } from "../controllers/activity.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", authenticate, getActivities);
export default router;
//# sourceMappingURL=activity.routes.js.map