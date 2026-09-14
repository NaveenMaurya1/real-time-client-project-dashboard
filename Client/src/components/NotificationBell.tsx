import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSocket } from "../services/socket";

interface Notification {
  id: number;
  userId: number;
  taskId: number | null;
  projectId: number | null;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  accessToken: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/**
 * Safely extract an API error message.
 */
const getErrorMessage = (
  result: unknown,
  fallback: string
): string => {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result
  ) {
    const error = (result as {
      error?: {
        message?: unknown;
      };
    }).error;

    if (
      error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
  }

  return fallback;
};

/**
 * Format notification timestamp.
 */
const formatNotificationTime = (
  createdAt: string
): string => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const now = Date.now();
  const difference =
    now - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  const minutes = Math.floor(
    seconds / 60
  );

  const hours = Math.floor(
    minutes / 60
  );

  const days = Math.floor(
    hours / 24
  );

  if (seconds < 10) {
    return "Just now";
  }

  if (minutes < 1) {
    return `${seconds}s ago`;
  }

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  if (days < 7) {
    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/**
 * Get a notification category based on
 * its available task/project information.
 */
const getNotificationType = (
  notification: Notification
): {
  label: string;
  icon: "task" | "project" | "info";
} => {
  if (notification.taskId) {
    return {
      label: "Task",
      icon: "task",
    };
  }

  if (notification.projectId) {
    return {
      label: "Project",
      icon: "project",
    };
  }

  return {
    label: "Update",
    icon: "info",
  };
};

export default function NotificationBell({
  accessToken,
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [markingId, setMarkingId] =
    useState<number | null>(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  /**
   * Load notifications from the API.
   */
  const loadNotifications =
    useCallback(async () => {
      if (!accessToken) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/notifications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }
        );

        let result: unknown;

        try {
          result = await response.json();
        } catch {
          throw new Error(
            "The server returned an invalid response"
          );
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              result,
              "Failed to fetch notifications"
            )
          );
        }

        if (
          typeof result !== "object" ||
          result === null ||
          !("data" in result)
        ) {
          throw new Error(
            "Invalid notifications response"
          );
        }

        const data = (
          result as {
            data?: unknown;
          }
        ).data;

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid notifications data"
          );
        }

        setNotifications(
          data as Notification[]
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load notifications"
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken]);

  /**
   * Load notifications whenever
   * authentication changes.
   */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Socket.IO real-time notifications.
   */
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket =
      createSocket(accessToken);

    const handleConnect = () => {
      /*
       * Reload from DB after connecting.
       *
       * This provides offline catch-up.
       */
      loadNotifications();
    };

    const handleNotification = (
      notification: Notification
    ) => {
      if (
        !notification ||
        typeof notification.id !==
          "number"
      ) {
        return;
      }

      setNotifications((current) => {
        const exists = current.some(
          (item) =>
            item.id ===
            notification.id
        );

        if (exists) {
          return current;
        }

        return [
          notification,
          ...current,
        ];
      });
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "notification:new",
      handleNotification
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "notification:new",
        handleNotification
      );

      socket.disconnect();
    };
  }, [
    accessToken,
    loadNotifications,
  ]);

  /**
   * Mark one notification as read.
   */
  const markAsRead = async (
    notificationId: number
  ) => {
    if (markingId !== null) {
      return;
    }

    try {
      setMarkingId(notificationId);

      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      let result: unknown = null;

      try {
        result = await response.json();
      } catch {
        /*
         * Some successful PATCH APIs may
         * return an empty response.
         */
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Failed to mark notification as read"
          )
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id ===
          notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch {
      /*
       * Keep the UI state unchanged when
       * the request fails.
       */
    } finally {
      setMarkingId(null);
    }
  };

  /**
   * Mark every notification as read.
   */
  const markAllAsRead = async () => {
    if (
      markingAll ||
      unreadCount === 0
    ) {
      return;
    }

    try {
      setMarkingAll(true);

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      let result: unknown = null;

      try {
        result = await response.json();
      } catch {
        /*
         * Empty successful response is
         * acceptable.
         */
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Failed to mark all notifications as read"
          )
        );
      }

      setNotifications((current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
      );
    } catch {
      /*
       * Keep existing state if request fails.
       */
    } finally {
      setMarkingAll(false);
    }
  };

  /**
   * Unread notification count.
   */
  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  return (
    <>
      <style>
        {`
          @keyframes notificationBellSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes notificationPulse {
            0% {
              box-shadow:
                0 0 0 0 rgba(79, 70, 229, 0.28);
            }

            70% {
              box-shadow:
                0 0 0 7px rgba(79, 70, 229, 0);
            }

            100% {
              box-shadow:
                0 0 0 0 rgba(79, 70, 229, 0);
            }
          }

          .notification-wrapper {
            position: relative;
          }

          .notification-trigger {
            position: relative;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
            border-radius: 11px;
            color: #475569;
            background: #ffffff;
            cursor: pointer;
            transition:
              color 0.2s ease,
              background 0.2s ease,
              border-color 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .notification-trigger:hover {
            color: #4f46e5;
            background: #f8faff;
            border-color: #c7d2fe;
            transform: translateY(-1px);
            box-shadow:
              0 5px 15px rgba(15, 23, 42, 0.08);
          }

          .notification-trigger.has-unread {
            animation:
              notificationPulse 2s infinite;
          }

          .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            min-width: 19px;
            height: 19px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            border: 2px solid white;
            border-radius: 999px;
            color: white;
            background: #ef4444;
            font-size: 9px;
            line-height: 1;
            font-weight: 800;
          }

          .notification-panel {
            position: fixed;
            top: 76px;
            right: max(20px, calc((100vw - 1400px) / 2));
            z-index: 1000;
            width: min(
              410px,
              calc(100vw - 32px)
            );
            max-height: min(
              680px,
              calc(100vh - 100px)
            );
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            background: #ffffff;
            box-shadow:
              0 24px 60px rgba(15, 23, 42, 0.16),
              0 4px 12px rgba(15, 23, 42, 0.06);
          }

          .notification-panel-header {
            flex: 0 0 auto;
            padding: 18px 18px 15px;
            border-bottom: 1px solid #eef2f7;
            background:
              linear-gradient(
                180deg,
                #ffffff 0%,
                #fafbff 100%
              );
          }

          .notification-header-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .notification-title-wrapper {
            min-width: 0;
          }

          .notification-title {
            margin: 0;
            color: #111827;
            font-size: 17px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .notification-subtitle {
            margin: 4px 0 0;
            color: #94a3b8;
            font-size: 11px;
            line-height: 1.4;
          }

          .notification-close {
            width: 32px;
            height: 32px;
            flex: 0 0 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
            border-radius: 9px;
            color: #64748b;
            background: #ffffff;
            cursor: pointer;
            transition:
              color 0.2s ease,
              background 0.2s ease,
              border-color 0.2s ease;
          }

          .notification-close:hover {
            color: #dc2626;
            background: #fef2f2;
            border-color: #fecaca;
          }

          .notification-header-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 15px;
          }

          .notification-unread-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #64748b;
            font-size: 11px;
            font-weight: 600;
          }

          .notification-unread-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #4f46e5;
          }

          .notification-mark-all {
            border: none;
            padding: 5px 0;
            color: #4f46e5;
            background: transparent;
            cursor: pointer;
            font-size: 11px;
            font-weight: 750;
            transition: color 0.2s ease;
          }

          .notification-mark-all:hover {
            color: #3730a3;
          }

          .notification-mark-all:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .notification-content {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            padding: 12px;
          }

          .notification-content::-webkit-scrollbar {
            width: 5px;
          }

          .notification-content::-webkit-scrollbar-track {
            background: transparent;
          }

          .notification-content::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: #cbd5e1;
          }

          .notification-item {
            position: relative;
            display: flex;
            gap: 11px;
            padding: 13px;
            margin-bottom: 8px;
            border: 1px solid #e8edf3;
            border-radius: 13px;
            background: #ffffff;
            transition:
              border-color 0.2s ease,
              background 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .notification-item:last-child {
            margin-bottom: 0;
          }

          .notification-item:hover {
            border-color: #dbe3ef;
            transform: translateY(-1px);
            box-shadow:
              0 5px 16px rgba(15, 23, 42, 0.05);
          }

          .notification-item.unread {
            border-color: #dbe4ff;
            background:
              linear-gradient(
                135deg,
                #f7f8ff,
                #ffffff
              );
          }

          .notification-item.unread::before {
            content: "";
            position: absolute;
            left: -1px;
            top: 10px;
            bottom: 10px;
            width: 3px;
            border-radius: 0 5px 5px 0;
            background: #6366f1;
          }

          .notification-icon {
            width: 35px;
            height: 35px;
            flex: 0 0 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: #4f46e5;
            background: #eef2ff;
          }

          .notification-item-body {
            min-width: 0;
            flex: 1;
          }

          .notification-item-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 6px;
          }

          .notification-type {
            display: inline-flex;
            align-items: center;
            padding: 3px 7px;
            border-radius: 999px;
            color: #4f46e5;
            background: #eef2ff;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .notification-time {
            flex-shrink: 0;
            color: #94a3b8;
            font-size: 10px;
          }

          .notification-message {
            margin: 0;
            color: #475569;
            font-size: 12px;
            line-height: 1.55;
            overflow-wrap: anywhere;
          }

          .notification-item.unread
            .notification-message {
            color: #1e293b;
            font-weight: 650;
          }

          .notification-item-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 9px;
          }

          .notification-read-button {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border: none;
            padding: 4px 0;
            color: #4f46e5;
            background: transparent;
            cursor: pointer;
            font-size: 10px;
            font-weight: 750;
          }

          .notification-read-button:hover {
            color: #3730a3;
          }

          .notification-read-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .notification-spinner {
            width: 12px;
            height: 12px;
            border: 2px solid #c7d2fe;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation:
              notificationBellSpin
              0.7s linear infinite;
          }

          .notification-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 180px;
            gap: 12px;
            color: #64748b;
            font-size: 12px;
          }

          .notification-loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #e0e7ff;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation:
              notificationBellSpin
              0.75s linear infinite;
          }

          .notification-error {
            margin: 12px;
            padding: 14px;
            border: 1px solid #fecaca;
            border-radius: 12px;
            background: #fef2f2;
          }

          .notification-error-title {
            margin: 0 0 4px;
            color: #991b1b;
            font-size: 12px;
            font-weight: 750;
          }

          .notification-error-text {
            margin: 0;
            color: #b91c1c;
            font-size: 11px;
            line-height: 1.5;
          }

          .notification-retry {
            margin-top: 9px;
            border: none;
            padding: 5px 0;
            color: #b91c1c;
            background: transparent;
            cursor: pointer;
            font-size: 11px;
            font-weight: 750;
          }

          .notification-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 230px;
            padding: 24px;
            text-align: center;
          }

          .notification-empty-icon {
            width: 58px;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
            border: 1px solid #e5e7eb;
            border-radius: 50%;
            color: #94a3b8;
            background: #f8fafc;
          }

          .notification-empty-title {
            margin: 0;
            color: #334155;
            font-size: 13px;
            font-weight: 750;
          }

          .notification-empty-text {
            max-width: 250px;
            margin: 5px 0 0;
            color: #94a3b8;
            font-size: 11px;
            line-height: 1.5;
          }

          @media (max-width: 600px) {
            .notification-panel {
              top: 66px;
              right: 10px;
              width: calc(100vw - 20px);
              max-height: calc(100vh - 82px);
              border-radius: 15px;
            }
          }
        `}
      </style>

      <div className="notification-wrapper">

        {/* Notification trigger */}
        <button
          type="button"
          className={`notification-trigger ${
            unreadCount > 0
              ? "has-unread"
              : ""
          }`}
          onClick={() =>
            setOpen((current) => !current)
          }
          aria-label={`Notifications${
            unreadCount > 0
              ? `, ${unreadCount} unread`
              : ""
          }`}
          aria-expanded={open}
          title="Notifications"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        {/* Notification panel */}
        {open && (
          <div
            className="notification-panel"
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="notification-panel-header">

              <div className="notification-header-top">

                <div className="notification-title-wrapper">
                  <h2 className="notification-title">
                    Notifications
                  </h2>

                  <p className="notification-subtitle">
                    Stay updated with your
                    project activity
                  </p>
                </div>

                <button
                  type="button"
                  className="notification-close"
                  onClick={() =>
                    setOpen(false)
                  }
                  aria-label="Close notifications"
                  title="Close"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6L18 18" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="notification-header-bottom">

                <div className="notification-unread-label">
                  {unreadCount > 0 && (
                    <span className="notification-unread-dot" />
                  )}

                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "All caught up"}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notification-mark-all"
                    onClick={
                      markAllAsRead
                    }
                    disabled={markingAll}
                  >
                    {markingAll
                      ? "Marking..."
                      : "Mark all as read"}
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="notification-content">

              {/* Loading */}
              {loading && (
                <div className="notification-loading">
                  <div className="notification-loading-spinner" />

                  <span>
                    Loading notifications...
                  </span>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="notification-error">
                  <p className="notification-error-title">
                    Unable to load notifications
                  </p>

                  <p className="notification-error-text">
                    {error}
                  </p>

                  <button
                    type="button"
                    className="notification-retry"
                    onClick={
                      loadNotifications
                    }
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loading &&
                !error &&
                notifications.length ===
                  0 && (
                  <div className="notification-empty">

                    <div className="notification-empty-icon">
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                        <path d="M10 21h4" />
                      </svg>
                    </div>

                    <h3 className="notification-empty-title">
                      No notifications yet
                    </h3>

                    <p className="notification-empty-text">
                      New task assignments and
                      project updates will appear
                      here.
                    </p>
                  </div>
                )}

              {/* Notification list */}
              {!loading &&
                !error &&
                notifications.length >
                  0 && (
                  <div>
                    {notifications.map(
                      (notification) => {
                        const type =
                          getNotificationType(
                            notification
                          );

                        return (
                          <div
                            key={
                              notification.id
                            }
                            className={`notification-item ${
                              !notification.read
                                ? "unread"
                                : ""
                            }`}
                          >
                            {/* Icon */}
                            <div className="notification-icon">
                              {type.icon ===
                                "task" && (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="16"
                                    rx="2"
                                  />

                                  <path d="M8 9h8" />
                                  <path d="M8 13h5" />
                                  <path d="M8 17h3" />
                                </svg>
                              )}

                              {type.icon ===
                                "project" && (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                                  <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v2" />
                                </svg>
                              )}

                              {type.icon ===
                                "info" && (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                  />

                                  <path d="M12 11v5" />
                                  <path d="M12 8h.01" />
                                </svg>
                              )}
                            </div>

                            {/* Content */}
                            <div className="notification-item-body">

                              <div className="notification-item-top">

                                <span className="notification-type">
                                  {type.label}
                                </span>

                                <span className="notification-time">
                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}
                                </span>
                              </div>

                              <p className="notification-message">
                                {
                                  notification.message
                                }
                              </p>

                              {!notification.read && (
                                <div className="notification-item-footer">

                                  <button
                                    type="button"
                                    className="notification-read-button"
                                    onClick={() =>
                                      markAsRead(
                                        notification.id
                                      )
                                    }
                                    disabled={
                                      markingId ===
                                      notification.id
                                    }
                                  >
                                    {markingId ===
                                    notification.id ? (
                                      <>
                                        <span className="notification-spinner" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <svg
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M20 6L9 17l-5-5" />
                                        </svg>

                                        Mark as read
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}