import {
  useEffect,
  useState,
} from "react";

import {
  getProjectManagerDashboard,
} from "../services/dashboard";

import type {
  ProjectManagerDashboardData,
} from "../services/dashboard";

interface ProjectManagerDashboardProps {
  accessToken: string;
}

export default function ProjectManagerDashboard({
  accessToken,
}: ProjectManagerDashboardProps) {
  const [dashboard, setDashboard] =
    useState<ProjectManagerDashboardData | null>(
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
          await getProjectManagerDashboard(
            accessToken
          );

        setDashboard(data);
      } catch (error) {
        console.error(
          "PM dashboard error:",
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
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
              width: "46px",
              height: "46px",
              margin: "0 auto 16px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation:
                "pmDashboardSpin 0.8s linear infinite",
            }}
          />

          <h3
            style={{
              margin: "0 0 6px",
              color: "#1e293b",
              fontSize: "16px",
            }}
          >
            Loading dashboard
          </h3>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Preparing your project overview...
          </p>
        </div>

        <style>
          {`
            @keyframes pmDashboardSpin {
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
          background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
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
            maxWidth: "480px",
            backgroundColor: "#ffffff",
            border: "1px solid #fecaca",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            boxShadow:
              "0 12px 35px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
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
              lineHeight: "1.6",
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
          background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "35px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(15, 23, 42, 0.06)",
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
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 5H19V19H5V5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              <path
                d="M8 9H16M8 13H16M8 17H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2
            style={{
              margin: "0 0 7px",
              color: "#1e293b",
              fontSize: "18px",
            }}
          >
            No dashboard data
          </h2>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            No dashboard information is currently
            available.
          </p>
        </div>
      </div>
    );
  }

  const totalPriorityTasks =
    dashboard.tasksByPriority.LOW +
    dashboard.tasksByPriority.MEDIUM +
    dashboard.tasksByPriority.HIGH +
    dashboard.tasksByPriority.CRITICAL;

  const getPriorityPercentage = (
    count: number
  ) => {
    if (totalPriorityTasks === 0) {
      return 0;
    }

    return Math.round(
      (count / totalPriorityTasks) * 100
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "35px 20px",
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
            alignItems: "flex-end",
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
                fontSize: "11px",
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
                  d="M16 21V19C16 16.79 14.21 15 12 15H6C3.79 15 2 16.79 2 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M19 8V14M16 11H22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              Project Management
            </div>

            <h1
              style={{
                margin: "0 0 8px",
                color: "#111827",
                fontSize: "32px",
                lineHeight: "1.2",
                fontWeight: 750,
              }}
            >
              Project Manager Dashboard
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Monitor your projects, tasks,
              priorities, and upcoming deadlines.
            </p>
          </div>

          {/* Live Status */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 13px",
              borderRadius: "9px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 4px 12px rgba(15, 23, 42, 0.04)",
              color: "#475569",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow:
                  "0 0 0 4px rgba(34, 197, 94, 0.12)",
              }}
            />

            Workspace Active
          </div>
        </div>

        {/* Stats */}
        <div
          className="pm-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            title="My Projects"
            value={dashboard.totalProjects}
            subtitle="Projects you manage"
            icon={
              <svg
                width="23"
                height="23"
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
            }
            iconBackground="#eef2ff"
            iconColor="#4f46e5"
          />

          <StatCard
            title="My Tasks"
            value={dashboard.totalTasks}
            subtitle="Tasks across your projects"
            icon={
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M8 9H16M8 13H16M8 17H12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            }
            iconBackground="#eff6ff"
            iconColor="#2563eb"
          />

          <StatCard
            title="Due This Week"
            value={dashboard.dueThisWeek}
            subtitle="Upcoming deadlines"
            icon={
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M8 3V7M16 3V7M4 10H20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <circle
                  cx="12"
                  cy="15"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            }
            iconBackground="#fff7ed"
            iconColor="#ea580c"
          />

          <StatCard
            title="Overdue Tasks"
            value={dashboard.overdueTasks}
            subtitle={
              dashboard.overdueTasks > 0
                ? "Needs your attention"
                : "Everything is on track"
            }
            icon={
              <svg
                width="23"
                height="23"
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
            }
            iconBackground={
              dashboard.overdueTasks > 0
                ? "#fef2f2"
                : "#f0fdf4"
            }
            iconColor={
              dashboard.overdueTasks > 0
                ? "#dc2626"
                : "#16a34a"
            }
            valueColor={
              dashboard.overdueTasks > 0
                ? "#dc2626"
                : "#111827"
            }
          />
        </div>

        {/* Main Content */}
        <div
          className="pm-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(320px, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Priority Panel */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "15px",
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
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 5px",
                    fontSize: "18px",
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  Tasks by Priority
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Distribution of tasks across your
                  projects
                </p>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 10px",
                  borderRadius: "7px",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {totalPriorityTasks} total
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <PriorityRow
                label="Low"
                count={
                  dashboard.tasksByPriority.LOW
                }
                percentage={getPriorityPercentage(
                  dashboard.tasksByPriority.LOW
                )}
                color="#16a34a"
                background="#f0fdf4"
              />

              <PriorityRow
                label="Medium"
                count={
                  dashboard.tasksByPriority.MEDIUM
                }
                percentage={getPriorityPercentage(
                  dashboard.tasksByPriority.MEDIUM
                )}
                color="#ca8a04"
                background="#fefce8"
              />

              <PriorityRow
                label="High"
                count={
                  dashboard.tasksByPriority.HIGH
                }
                percentage={getPriorityPercentage(
                  dashboard.tasksByPriority.HIGH
                )}
                color="#ea580c"
                background="#fff7ed"
              />

              <PriorityRow
                label="Critical"
                count={
                  dashboard.tasksByPriority
                    .CRITICAL
                }
                percentage={getPriorityPercentage(
                  dashboard.tasksByPriority
                    .CRITICAL
                )}
                color="#dc2626"
                background="#fef2f2"
              />
            </div>
          </div>

          {/* Overview Panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Weekly Focus */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "15px",
                padding: "24px",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
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
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6V12L16 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      color: "#111827",
                    }}
                  >
                    Weekly Focus
                  </h2>

                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Upcoming workload
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "11px",
                  background:
                    "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                  border: "1px solid #e0e7ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "15px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#6366f1",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      TASKS DUE
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#111827",
                        fontSize: "32px",
                        lineHeight: 1,
                        fontWeight: 750,
                      }}
                    >
                      {dashboard.dueThisWeek}
                    </p>
                  </div>

                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      color: "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 12L10 15L17 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: "1.5",
                  }}
                >
                  Keep an eye on these tasks to
                  ensure your projects stay on schedule.
                </p>
              </div>
            </div>

            {/* Attention */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border:
                  dashboard.overdueTasks > 0
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
                borderRadius: "15px",
                padding: "22px",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "13px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    flexShrink: 0,
                    borderRadius: "10px",
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
                    justifyContent: "center",
                  }}
                >
                  {dashboard.overdueTasks >
                  0 ? (
                    <svg
                      width="21"
                      height="21"
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
                      width="21"
                      height="21"
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
                        d="M8.5 12L11 14.5L15.5 9.5"
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
                      margin: "2px 0 5px",
                      fontSize: "15px",
                      color: "#111827",
                    }}
                  >
                    {dashboard.overdueTasks >
                    0
                      ? "Attention Required"
                      : "Everything Looks Good"}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "12px",
                      lineHeight: "1.55",
                    }}
                  >
                    {dashboard.overdueTasks >
                    0
                      ? `You currently have ${dashboard.overdueTasks} overdue ${
                          dashboard.overdueTasks ===
                          1
                            ? "task"
                            : "tasks"
                        }. Review them and take action.`
                      : "There are no overdue tasks in your projects. Your workload is on track."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div
          style={{
            marginTop: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "15px",
            padding: "18px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            boxShadow:
              "0 6px 18px rgba(15, 23, 42, 0.04)",
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
                color: "#475569",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Project manager workspace is active
            </span>
          </div>

          <span
            style={{
              color: "#94a3b8",
              fontSize: "11px",
            }}
          >
            {dashboard.totalProjects}{" "}
            {dashboard.totalProjects === 1
              ? "project"
              : "projects"}{" "}
            • {dashboard.totalTasks}{" "}
            {dashboard.totalTasks === 1
              ? "task"
              : "tasks"}
          </span>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 950px) {
            .pm-stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .pm-main-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            .pm-stats-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* ----------------------------- */
/* Stat Card */
/* ----------------------------- */

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBackground: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor = "#111827",
}: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "20px",
        boxShadow:
          "0 7px 20px rgba(15, 23, 42, 0.05)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 8px",
              color: "#64748b",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {title}
          </p>

          <p
            style={{
              margin: 0,
              color: valueColor,
              fontSize: "30px",
              lineHeight: 1,
              fontWeight: 750,
            }}
          >
            {value}
          </p>
        </div>

        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "11px",
            backgroundColor: iconBackground,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <p
        style={{
          margin: "13px 0 0",
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* ----------------------------- */
/* Priority Row */
/* ----------------------------- */

interface PriorityRowProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
  background: string;
}

function PriorityRow({
  label,
  count,
  percentage,
  color,
  background,
}: PriorityRowProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "8px",
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
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 0 4px ${background}`,
            }}
          />

          <span
            style={{
              color: "#374151",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {label}
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
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {count}
          </span>

          <span
            style={{
              minWidth: "38px",
              textAlign: "right",
              color: "#94a3b8",
              fontSize: "11px",
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <div
        style={{
          height: "8px",
          width: "100%",
          borderRadius: "20px",
          backgroundColor: "#f1f5f9",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            borderRadius: "20px",
            backgroundColor: color,
            transition:
              "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}