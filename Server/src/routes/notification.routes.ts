import { Router } from "express";

import {
  listNotifications,
  markAllAsRead,
  markAsRead,
  unreadCount,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  listNotifications
);

router.get(
  "/unread-count",
  authenticate,
  unreadCount
);

router.patch(
  "/read-all",
  authenticate,
  markAllAsRead
);

router.patch(
  "/:id/read",
  authenticate,
  markAsRead
);

export default router;