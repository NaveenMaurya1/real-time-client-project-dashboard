import {
  useEffect,
  useState,
} from "react";

import { createSocket } from "../services/socket";

interface Activity {
  id: number;
  taskId: number;
  projectId: number;
  userId: number;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
}

interface ActivityFeedProps {
  accessToken: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function ActivityFeed({
  accessToken,
}: ActivityFeedProps) {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Load the last 20 authorized activities
   * from the database.
   *
   * This also provides offline catch-up.
   */
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/activity`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch activities"
        );
      }

      const result = await response.json();

      setActivities(
        result.data.activities || []
      );
    } catch (error) {
      console.error(
        "Failed to load activities:",
        error
      );

      setError(
        "Failed to load activity feed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    /*
     * Initial database load.
     */
    loadActivities();

    /*
     * Create Socket.IO connection.
     */
    const socket =
      createSocket(accessToken);

    /*
     * When socket connects, reload the
     * latest authorized activities.
     *
     * This handles offline catch-up.
     */
    socket.on("connect", () => {
      console.log(
        "Activity socket connected:",
        socket.id
      );

      loadActivities();
    });

    /*
     * Listen for real-time activity.
     */
    socket.on(
      "activity:new",
      (activity: Activity) => {
        console.log(
          "New activity received:",
          activity
        );

        setActivities((current) => {
          /*
           * Prevent duplicate activity entries.
           */
          const alreadyExists =
            current.some(
              (item) =>
                item.id === activity.id
            );

          if (alreadyExists) {
            return current;
          }

          /*
           * Add newest activity at the top.
           */
          return [
            activity,
            ...current,
          ].slice(0, 20);
        });
      }
    );

    /*
     * Socket error handling.
     */
    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Activity socket error:",
          error
        );
      }
    );

    /*
     * Cleanup when component unmounts.
     */
    return () => {
      socket.off("connect");

      socket.off(
        "activity:new"
      );

      socket.off(
        "connect_error"
      );

      socket.disconnect();
    };
  }, [accessToken]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "320px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 14px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation:
                "activitySpin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Loading activity...
          </p>
        </div>

        <style>
          {`
            @keyframes activitySpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #fecaca",
          borderRadius: "14px",
          padding: "28px",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <ActivityHeader />

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px",
            borderRadius: "9px",
            backgroundColor: "#fef2f2",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M12 7V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle
              cx="12"
              cy="16.5"
              r="1"
              fill="currentColor"
            />
          </svg>

          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "24px",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.05)",
      }}
    >
      <ActivityHeader />

      {/* Activity Count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginTop: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Latest authorized activity
        </p>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: "7px",
            backgroundColor: "#f8fafc",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {activities.length} / 20 events
        </div>
      </div>

      {/* Empty State */}
      {activities.length === 0 ? (
        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
            padding: "45px 20px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 14px",
              borderRadius: "50%",
              backgroundColor: "#eef2ff",
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12H8L10 5L14 19L16 12H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3
            style={{
              margin: "0 0 6px",
              fontSize: "16px",
              color: "#374151",
            }}
          >
            No activity yet
          </h3>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Task status changes will appear
            here in real time.
          </p>
        </div>
      ) : (
        /*
         * Timeline
         */
        <div
          style={{
            position: "relative",
          }}
        >
          {/* Vertical Timeline Line */}
          <div
            style={{
              position: "absolute",
              left: "18px",
              top: "12px",
              bottom: "12px",
              width: "2px",
              backgroundColor: "#e2e8f0",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {activities.map(
              (activity, index) => {
                const statusInfo =
                  getStatusInfo(
                    activity.toStatus
                  );

                return (
                  <div
                    key={activity.id}
                    style={{
                      position: "relative",
                      display: "flex",
                      gap: "15px",
                    }}
                  >
                    {/* Timeline Icon */}
                    <div
                      style={{
                        position:
                          "relative",
                        zIndex: 1,
                        width: "38px",
                        height: "38px",
                        flexShrink: 0,
                        borderRadius: "50%",
                        backgroundColor:
                          statusInfo.background,
                        color:
                          statusInfo.color,
                        border:
                          "4px solid #ffffff",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        boxShadow:
                          "0 0 0 1px #e2e8f0",
                      }}
                    >
                      {statusInfo.icon}
                    </div>

                    {/* Activity Content */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        paddingBottom:
                          index ===
                          activities.length -
                            1
                            ? 0
                            : "2px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor:
                            "#f8fafc",
                          border:
                            "1px solid #e5e7eb",
                          borderRadius:
                            "10px",
                          padding:
                            "14px 16px",
                        }}
                      >
                        {/* Top Row */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap: "12px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "7px",
                                flexWrap:
                                  "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize:
                                    "14px",
                                  fontWeight:
                                    700,
                                  color:
                                    "#111827",
                                }}
                              >
                                Task #
                                {
                                  activity.taskId
                                }
                              </span>

                              <span
                                style={{
                                  color:
                                    "#cbd5e1",
                                }}
                              >
                                •
                              </span>

                              <span
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    "#64748b",
                                }}
                              >
                                Project #
                                {
                                  activity.projectId
                                }
                              </span>
                            </div>

                            <p
                              style={{
                                margin:
                                  "8px 0 0",
                                color:
                                  "#374151",
                                fontSize:
                                  "13px",
                                lineHeight:
                                  "1.5",
                              }}
                            >
                              {formatStatus(
                                activity.fromStatus
                              )}{" "}
                              <span
                                style={{
                                  color:
                                    "#94a3b8",
                                  margin:
                                    "0 4px",
                                }}
                              >
                                →
                              </span>{" "}
                              <strong
                                style={{
                                  color:
                                    statusInfo.color,
                                }}
                              >
                                {formatStatus(
                                  activity.toStatus
                                )}
                              </strong>
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "20px",
                              backgroundColor:
                                statusInfo.background,
                              color:
                                statusInfo.color,
                              fontSize:
                                "11px",
                              fontWeight:
                                700,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatStatus(
                              activity.toStatus
                            )}
                          </span>
                        </div>

                        {/* Bottom Info */}
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "6px",
                            marginTop:
                              "12px",
                            paddingTop:
                              "10px",
                            borderTop:
                              "1px solid #e5e7eb",
                            color:
                              "#94a3b8",
                            fontSize:
                              "11px",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />

                            <path
                              d="M12 8V12L15 14"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          {formatActivityTime(
                            activity.createdAt
                          )}

                          <span
                            style={{
                              margin:
                                "0 3px",
                            }}
                          >
                            •
                          </span>

                          <span>
                            User #
                            {
                              activity.userId
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * Activity header
 */
function ActivityHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "11px",
            background:
              "linear-gradient(135deg, #4f46e5, #6366f1)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 6px 14px rgba(79, 70, 229, 0.22)",
          }}
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12H8L10 5L14 19L16 12H20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "19px",
                fontWeight: 700,
              }}
            >
              Live Activity
            </h2>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 7px",
                borderRadius: "20px",
                backgroundColor: "#f0fdf4",
                color: "#15803d",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                }}
              />

              Live
            </span>
          </div>

          <p
            style={{
              margin: "4px 0 0",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            Real-time task status updates
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * Status information
 */
function getStatusInfo(status: string) {
  switch (status) {
    case "TODO":
      return {
        background: "#f1f5f9",
        color: "#475569",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ),
      };

    case "IN_PROGRESS":
      return {
        background: "#eff6ff",
        color: "#2563eb",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V12L16 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ),
      };

    case "IN_REVIEW":
      return {
        background: "#fff7ed",
        color: "#ea580c",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12C4 12 7 6 12 6C17 6 20 12 20 12C20 12 17 18 12 18C7 18 4 12 4 12Z"
              stroke="currentColor"
              strokeWidth="2"
            />

            <circle
              cx="12"
              cy="12"
              r="2.5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ),
      };

    case "DONE":
      return {
        background: "#f0fdf4",
        color: "#16a34a",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M8.5 12L11 14.5L15.5 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      };

    case "OVERDUE":
      return {
        background: "#fef2f2",
        color: "#dc2626",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L21 19H3L12 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <path
              d="M12 9V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle
              cx="12"
              cy="16"
              r="1"
              fill="currentColor"
            />
          </svg>
        ),
      };

    default:
      return {
        background: "#eef2ff",
        color: "#4f46e5",
        icon: (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      };
  }
}

function formatStatus(
  status: string | null
) {
  if (!status) {
    return "Created";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatActivityTime(
  date: string
) {
  const activityDate =
    new Date(date);

  const now = new Date();

  const difference =
    now.getTime() -
    activityDate.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  return activityDate.toLocaleString();
}