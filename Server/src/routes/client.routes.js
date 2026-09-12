import { Router } from "express";
import { listClients } from "../controllers/client.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", authenticate, listClients);
export default router;
//# sourceMappingURL=client.routes.js.map