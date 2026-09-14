import {
  useEffect,
  useState,
} from "react";

import { getAdminDashboard } from "../services/dashboard";
import type { AdminDashboardData } from "../services/dashboard";

interface AdminDashboardProps {
  accessToken: string;
  onlineUsers: number;
}

export default function AdminDashboard({
  accessToken,
  onlineUsers,
}: AdminDashboardProps) {
  const [dashboard, setDashboard] =
    useState<AdminDashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getAdminDashboard(accessToken);

        setDashboard(data);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      loadDashboard();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              margin: "0 auto 14px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation:
                "adminDashboardSpin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Loading dashboard...
          </p>
        </div>

        <style>
          {`
            @keyframes adminDashboardSpin {
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

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            backgroundColor: "#ffffff",
            border: "1px solid #fecaca",
            borderRadius: "14px",
            padding: "30px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
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
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#111827",
              fontSize: "20px",
            }}
          >
            Unable to load dashboard
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <p>No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const totalTasks =
    dashboard.totalTasks || 0;

  const getPercentage = (
    value: number
  ) => {
    if (totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (value / totalTasks) * 100
    );
  };

  const statusItems = [
    {
      label: "To Do",
      value: dashboard.tasksByStatus.TODO,
      icon: (
        <svg
          width="18"
          height="18"
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
        </svg>
      ),
      background: "#f1f5f9",
      color: "#475569",
    },
    {
      label: "In Progress",
      value:
        dashboard.tasksByStatus.IN_PROGRESS,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4V12L17 15"
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
      background: "#eff6ff",
      color: "#2563eb",
    },
    {
      label: "In Review",
      value:
        dashboard.tasksByStatus.IN_REVIEW,
      icon: (
        <svg
          width="18"
          height="18"
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
      background: "#fff7ed",
      color: "#ea580c",
    },
    {
      label: "Done",
      value:
        dashboard.tasksByStatus.DONE,
      icon: (
        <svg
          width="18"
          height="18"
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
      background: "#f0fdf4",
      color: "#16a34a",
    },
  ];

  const statCards = [
    {
      title: "Total Projects",
      value: dashboard.totalProjects,
      subtitle: "Active projects",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 7.5C4 6.67 4.67 6 5.5 6H10L12 8H18.5C19.33 8 20 8.67 20 9.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V7.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ),
      background: "#eef2ff",
      color: "#4f46e5",
    },
    {
      title: "Total Tasks",
      value: dashboard.totalTasks,
      subtitle: "Across all projects",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5"
            y="4"
            width="14"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <path
            d="M8 9H16M8 13H16M8 17H13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      background: "#eff6ff",
      color: "#2563eb",
    },
    {
      title: "Overdue Tasks",
      value: dashboard.overdueTasks,
      subtitle:
        dashboard.overdueTasks > 0
          ? "Requires attention"
          : "Everything is on track",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L21 19H3L12 4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          <path
            d="M12 9V13"
            stroke="currentColor"
            strokeWidth="1.8"
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
      background: "#fef2f2",
      color: "#dc2626",
    },
    {
      title: "Online Users",
      value: onlineUsers,
      subtitle: "Currently connected",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <path
            d="M5 19C5 15.69 8.13 13 12 13C15.87 13 19 15.69 19 19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      background: "#f0fdf4",
      color: "#16a34a",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "32px 24px 50px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 11px",
                borderRadius: "20px",
                backgroundColor: "#e0e7ff",
                color: "#4338ca",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 20V10M10 20V4M16 20V13M22 20V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              Administration
            </div>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "32px",
                lineHeight: "1.2",
                fontWeight: 750,
                color: "#111827",
              }}
            >
              Admin Dashboard
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              Monitor projects, tasks and team
              activity from one place.
            </p>
          </div>

          {/* Live Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "10px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow:
                "0 4px 12px rgba(15, 23, 42, 0.05)",
            }}
          >
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow:
                  "0 0 0 4px rgba(34, 197, 94, 0.12)",
              }}
            />

            <span
              style={{
                color: "#374151",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              System Live
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "20px",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.05)",
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 9px",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {card.title}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#111827",
                      fontSize: "30px",
                      lineHeight: "1",
                      fontWeight: 750,
                    }}
                  >
                    {card.value}
                  </p>
                </div>

                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "11px",
                    backgroundColor:
                      card.background,
                    color: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
              </div>

              <p
                style={{
                  margin: "15px 0 0",
                  color:
                    card.title === "Overdue Tasks" &&
                    dashboard.overdueTasks > 0
                      ? "#dc2626"
                      : "#94a3b8",
                  fontSize: "12px",
                }}
              >
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(300px, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Task Status */}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 5px",
                    fontSize: "19px",
                    color: "#111827",
                  }}
                >
                  Tasks by Status
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  Current task distribution
                </p>
              </div>

              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {totalTasks} Tasks
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {statusItems.map((item) => {
                const percentage =
                  getPercentage(item.value);

                return (
                  <div key={item.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginBottom: "9px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor:
                              item.background,
                            color: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          {item.icon}
                        </div>

                        <span
                          style={{
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          {item.label}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            color: "#111827",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          {item.value}
                        </span>

                        <span
                          style={{
                            color: "#94a3b8",
                            fontSize: "12px",
                          }}
                        >
                          ({percentage}%)
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "20px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor:
                            item.color,
                          borderRadius: "20px",
                          transition:
                            "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overview */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Completion Card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, #4f46e5, #6366f1)",
                borderRadius: "14px",
                padding: "24px",
                color: "#ffffff",
                boxShadow:
                  "0 10px 25px rgba(79, 70, 229, 0.22)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "15px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "13px",
                      opacity: 0.8,
                    }}
                  >
                    Completion Rate
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "34px",
                      lineHeight: "1",
                      fontWeight: 750,
                    }}
                  >
                    {getPercentage(
                      dashboard.tasksByStatus.DONE
                    )}
                    %
                  </p>
                </div>

                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ opacity: 0.8 }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M8 12L11 15L16 9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  height: "7px",
                  backgroundColor:
                    "rgba(255,255,255,0.22)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${getPercentage(
                      dashboard.tasksByStatus.DONE
                    )}%`,
                    height: "100%",
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                  }}
                />
              </div>

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                {dashboard.tasksByStatus.DONE}{" "}
                of {totalTasks} tasks completed
              </p>
            </div>

            {/* Attention Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "22px",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "17px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "9px",
                    backgroundColor:
                      dashboard.overdueTasks > 0
                        ? "#fef2f2"
                        : "#f0fdf4",
                    color:
                      dashboard.overdueTasks > 0
                        ? "#dc2626"
                        : "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                  }}
                >
                  {dashboard.overdueTasks >
                  0 ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L21 19H3L12 4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M12 9V13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="12"
                        cy="16"
                        r="1"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
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
                        strokeWidth="1.8"
                      />

                      <path
                        d="M8 12L11 15L16 9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "#111827",
                      fontSize: "16px",
                    }}
                  >
                    {dashboard.overdueTasks >
                    0
                      ? "Needs Attention"
                      : "Everything Looks Good"}
                  </h3>

                  <p
                    style={{
                      margin: "3px 0 0",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    Task deadline overview
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "13px",
                  borderRadius: "9px",
                  backgroundColor:
                    dashboard.overdueTasks > 0
                      ? "#fef2f2"
                      : "#f0fdf4",
                  color:
                    dashboard.overdueTasks > 0
                      ? "#b91c1c"
                      : "#15803d",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {dashboard.overdueTasks > 0
                  ? `${dashboard.overdueTasks} task${
                      dashboard.overdueTasks ===
                      1
                        ? ""
                        : "s"
                    } currently overdue and ${
                      dashboard.overdueTasks ===
                      1
                        ? "requires"
                        : "require"
                    } attention.`
                  : "There are currently no overdue tasks. Your team is on track."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div
          style={{
            marginTop: "20px",
            padding: "18px 20px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
            boxShadow:
              "0 5px 18px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
              }}
            />

            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Live dashboard data
            </span>
          </div>

          <span
            style={{
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Real-time users:{" "}
            <strong
              style={{
                color: "#374151",
              }}
            >
              {onlineUsers}
            </strong>
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes adminDashboardSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 850px) {
            .admin-dashboard-main-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}