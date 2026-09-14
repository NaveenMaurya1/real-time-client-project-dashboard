import { useEffect, useState } from "react";

import {
  getDeveloperDashboard,
} from "../services/dashboard";

import type {
  DeveloperDashboardData,
} from "../services/dashboard";

interface DeveloperDashboardProps {
  accessToken: string;
}

export default function DeveloperDashboard({
  accessToken,
}: DeveloperDashboardProps) {
  const [dashboard, setDashboard] =
    useState<DeveloperDashboardData | null>(
      null
    );

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
          await getDeveloperDashboard(
            accessToken
          );

        setDashboard(data);
      } catch (error) {
        console.error(
          "Developer dashboard error:",
          error
        );

        setError(
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      loadDashboard();
    }
  }, [accessToken]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border:
                "4px solid #e2e8f0",
              borderTop:
                "4px solid #2563eb",
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation:
                "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: "15px",
            }}
          >
            Loading dashboard...
          </p>
        </div>
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
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            backgroundColor: "white",
            borderRadius: "14px",
            padding: "30px",
            textAlign: "center",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "55px",
              height: "55px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: "700",
            }}
          >
            !
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#111827",
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  /*
   * No data state
   */
  if (!dashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#64748b",
          }}
        >
          No dashboard data available.
        </p>
      </div>
    );
  }

  /*
   * Calculate completion percentage.
   */
  const completionPercentage =
    dashboard.totalAssigned > 0
      ? Math.round(
          (dashboard.tasksByStatus.DONE /
            dashboard.totalAssigned) *
            100
        )
      : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "30px",
        boxSizing: "border-box",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* Main Container */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Developer Workspace
          </p>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "32px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Developer Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Track your assigned tasks,
            progress, priorities and deadlines.
          </p>
        </div>

        {/* Overview Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          {/* Assigned Tasks */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "22px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                My Assigned Tasks
              </span>

              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor:
                    "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontSize: "18px",
                }}
              >
                ✓
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#0f172a",
              }}
            >
              {dashboard.totalAssigned}
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Total tasks assigned
            </p>
          </div>

          {/* Overdue Tasks */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "22px",
              border:
                "1px solid #fee2e2",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Overdue Tasks
              </span>

              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor:
                    "#fef2f2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontSize: "18px",
                }}
              >
                !
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color:
                  dashboard.overdueTasks >
                  0
                    ? "#dc2626"
                    : "#0f172a",
              }}
            >
              {dashboard.overdueTasks}
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Tasks past their deadline
            </p>
          </div>

          {/* Completed Tasks */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "22px",
              border:
                "1px solid #dcfce7",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Completed
              </span>

              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor:
                    "#f0fdf4",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontSize: "18px",
                }}
              >
                ✓
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#16a34a",
              }}
            >
              {dashboard.tasksByStatus.DONE}
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Tasks completed
            </p>
          </div>

          {/* Completion */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "22px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Completion Rate
              </span>

              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#2563eb",
                }}
              >
                {completionPercentage}%
              </span>
            </div>

            <div
              style={{
                height: "9px",
                backgroundColor: "#e2e8f0",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionPercentage}%`,
                  height: "100%",
                  backgroundColor:
                    "#2563eb",
                  borderRadius: "20px",
                  transition:
                    "width 0.4s ease",
                }}
              />
            </div>

            <p
              style={{
                margin:
                  "10px 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Overall task completion
            </p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Tasks by Status */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "24px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 5px",
                  fontSize: "19px",
                  color: "#0f172a",
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
                Current state of your tasks
              </p>
            </div>

            {/* To Do */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  To Do
                </span>

                <strong>
                  {
                    dashboard
                      .tasksByStatus
                      .TODO
                  }
                </strong>
              </div>

              <div
                style={{
                  height: "7px",
                  backgroundColor:
                    "#e2e8f0",
                  borderRadius:
                    "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      dashboard.totalAssigned >
                      0
                        ? (dashboard.tasksByStatus
                            .TODO /
                            dashboard.totalAssigned) *
                          100
                        : 0
                    }%`,
                    height: "100%",
                    backgroundColor:
                      "#64748b",
                  }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  In Progress
                </span>

                <strong>
                  {
                    dashboard
                      .tasksByStatus
                      .IN_PROGRESS
                  }
                </strong>
              </div>

              <div
                style={{
                  height: "7px",
                  backgroundColor:
                    "#e2e8f0",
                  borderRadius:
                    "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      dashboard.totalAssigned >
                      0
                        ? (dashboard.tasksByStatus
                            .IN_PROGRESS /
                            dashboard.totalAssigned) *
                          100
                        : 0
                    }%`,
                    height: "100%",
                    backgroundColor:
                      "#2563eb",
                  }}
                />
              </div>
            </div>

            {/* In Review */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  In Review
                </span>

                <strong>
                  {
                    dashboard
                      .tasksByStatus
                      .IN_REVIEW
                  }
                </strong>
              </div>

              <div
                style={{
                  height: "7px",
                  backgroundColor:
                    "#e2e8f0",
                  borderRadius:
                    "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      dashboard.totalAssigned >
                      0
                        ? (dashboard.tasksByStatus
                            .IN_REVIEW /
                            dashboard.totalAssigned) *
                          100
                        : 0
                    }%`,
                    height: "100%",
                    backgroundColor:
                      "#d97706",
                  }}
                />
              </div>
            </div>

            {/* Done */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Done
                </span>

                <strong>
                  {
                    dashboard
                      .tasksByStatus
                      .DONE
                  }
                </strong>
              </div>

              <div
                style={{
                  height: "7px",
                  backgroundColor:
                    "#e2e8f0",
                  borderRadius:
                    "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      dashboard.totalAssigned >
                      0
                        ? (dashboard.tasksByStatus
                            .DONE /
                            dashboard.totalAssigned) *
                          100
                        : 0
                    }%`,
                    height: "100%",
                    backgroundColor:
                      "#16a34a",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tasks by Priority */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "24px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 5px",
                  fontSize: "19px",
                  color: "#0f172a",
                }}
              >
                Tasks by Priority
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                Focus on your most important work
              </p>
            </div>

            {/* Critical */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "10px",
                backgroundColor:
                  "#fef2f2",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius:
                      "50%",
                    backgroundColor:
                      "#dc2626",
                  }}
                />

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#991b1b",
                  }}
                >
                  Critical
                </span>
              </div>

              <strong
                style={{
                  color: "#991b1b",
                }}
              >
                {
                  dashboard
                    .tasksByPriority
                    .CRITICAL
                }
              </strong>
            </div>

            {/* High */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "10px",
                backgroundColor:
                  "#fff7ed",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius:
                      "50%",
                    backgroundColor:
                      "#ea580c",
                  }}
                />

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#9a3412",
                  }}
                >
                  High
                </span>
              </div>

              <strong
                style={{
                  color: "#9a3412",
                }}
              >
                {
                  dashboard
                    .tasksByPriority
                    .HIGH
                }
              </strong>
            </div>

            {/* Medium */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "10px",
                backgroundColor:
                  "#fffbeb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius:
                      "50%",
                    backgroundColor:
                      "#d97706",
                  }}
                />

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#92400e",
                  }}
                >
                  Medium
                </span>
              </div>

              <strong
                style={{
                  color: "#92400e",
                }}
              >
                {
                  dashboard
                    .tasksByPriority
                    .MEDIUM
                }
              </strong>
            </div>

            {/* Low */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding: "14px",
                borderRadius: "10px",
                backgroundColor:
                  "#f0fdf4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius:
                      "50%",
                    backgroundColor:
                      "#16a34a",
                  }}
                />

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#166534",
                  }}
                >
                  Low
                </span>
              </div>

              <strong
                style={{
                  color: "#166534",
                }}
              >
                {
                  dashboard
                    .tasksByPriority
                    .LOW
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {dashboard.overdueTasks > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px 20px",
              borderRadius: "12px",
              backgroundColor: "#fff7ed",
              border:
                "1px solid #fed7aa",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor:
                  "#ffedd5",
                color: "#ea580c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              !
            </div>

            <div>
              <h3
                style={{
                  margin:
                    "0 0 4px",
                  fontSize: "15px",
                  color: "#9a3412",
                }}
              >
                You have overdue tasks
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#c2410c",
                }}
              >
                {dashboard.overdueTasks}{" "}
                {dashboard.overdueTasks ===
                1
                  ? "task is"
                  : "tasks are"}{" "}
                past the deadline. Consider
                reviewing them.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading animation */}
      <style>
        {`
          @keyframes spin {
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

