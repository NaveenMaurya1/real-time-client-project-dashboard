import { useEffect, useState } from "react";
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

const API_URL = "http://localhost:5000";

export default function NotificationBell({
  accessToken,
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Load notifications from database.
   */

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch notifications"
        );
      }

      const result =
        await response.json();

      setNotifications(
        result.data.notifications || []
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setError(
        "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Mark one notification as read.
   */

  const markAsRead = async (
    notificationId: number
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
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
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  /*
   * Mark every notification as read.
   */

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark all notifications as read"
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    /*
     * Initial database load.
     */

    loadNotifications();

    /*
     * Create Socket.IO connection.
     */

    const socket =
      createSocket(accessToken);

    socket.on("connect", () => {
      console.log(
        "Notification socket connected:",
        socket.id
      );

      /*
       * Reload from DB on reconnect.
       *
       * This gives us offline catch-up.
       */

      loadNotifications();
    });

    /*
     * Listen for new notifications.
     */

    socket.on(
      "notification:new",
      (
        notification: Notification
      ) => {
        console.log(
          "New notification:",
          notification
        );

        setNotifications((current) => {
          const exists =
            current.some(
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
      }
    );

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Notification socket error:",
          error
        );
      }
    );

    return () => {
      socket.off("connect");

      socket.off(
        "notification:new"
      );

      socket.off(
        "connect_error"
      );

      socket.disconnect();
    };
  }, [accessToken]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        marginBottom: "20px",
      }}
    >
      <button
        onClick={() =>
          setOpen((value) => !value)
        }
        style={{
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        🔔 Notifications

        {unreadCount > 0 && (
          <span
            style={{
              marginLeft: "8px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "3px 7px",
              fontSize: "12px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "45px",
            right: 0,
            width: "360px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            zIndex: 1000,
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3>
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading && (
            <p>
              Loading notifications...
            </p>
          )}

          {error && (
            <p>{error}</p>
          )}

          {!loading &&
            !error &&
            notifications.length === 0 && (
              <p>
                No notifications.
              </p>
            )}

          {!loading &&
            !error &&
            notifications.length > 0 && (
              <div>
                {notifications.map(
                  (notification) => (
                    <div
                      key={
                        notification.id
                      }
                      style={{
                        padding: "12px",
                        marginBottom: "8px",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "6px",
                        backgroundColor:
                          notification.read
                            ? "#fff"
                            : "#f0f7ff",
                      }}
                    >
                      <p
                        style={{
                          fontWeight:
                            notification.read
                              ? "normal"
                              : "bold",
                        }}
                      >
                        {
                          notification.message
                        }
                      </p>

                      <small>
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </small>

                      {!notification.read && (
                        <div
                          style={{
                            marginTop:
                              "8px",
                          }}
                        >
                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}