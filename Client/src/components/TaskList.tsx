import {
  useEffect,
  useState,
} from "react";

import {
  getTasks,
  updateTaskStatus,
} from "../services/tasks";

import type { Task } from "../services/tasks";

interface TaskListProps {
  accessToken: string;
  role: string;
  refreshKey?: number;
}

const STATUS_OPTIONS = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

const PRIORITY_OPTIONS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const getInitialFilters = () => {
  const params = new URLSearchParams(
    window.location.search
  );

  return {
    status: params.get("status") || "",
    priority: params.get("priority") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
  };
};

const updateUrl = (
  newStatus: string,
  newPriority: string,
  newFrom: string,
  newTo: string
) => {
  const params = new URLSearchParams();

  if (newStatus) {
    params.set("status", newStatus);
  }

  if (newPriority) {
    params.set("priority", newPriority);
  }

  if (newFrom) {
    params.set("from", newFrom);
  }

  if (newTo) {
    params.set("to", newTo);
  }

  const query = params.toString();

  const newUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;

  window.history.replaceState(
    {},
    "",
    newUrl
  );
};

export default function TaskList({
  accessToken,
  role,
  refreshKey = 0,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const initialFilters = getInitialFilters();

  const [status, setStatus] = useState(
    initialFilters.status
  );

  const [priority, setPriority] = useState(
    initialFilters.priority
  );

  const [from, setFrom] = useState(
    initialFilters.from
  );

  const [to, setTo] = useState(
    initialFilters.to
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [updatingTaskId, setUpdatingTaskId] =
    useState<number | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTasks(
        accessToken,
        {
          status: status || undefined,
          priority: priority || undefined,
          from: from || undefined,
          to: to || undefined,
        }
      );

      setTasks(data);
    } catch (error) {
      console.error(
        "Failed to load tasks:",
        error
      );

      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadTasks();
    }
  }, [
    accessToken,
    status,
    priority,
    from,
    to,
    refreshKey,
  ]);

  const handleStatusChange = async (
    taskId: number,
    newStatus: string
  ) => {
    try {
      setUpdatingTaskId(taskId);

      await updateTaskStatus(
        accessToken,
        taskId,
        newStatus
      );

      await loadTasks();
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update task"
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const clearFilters = () => {
    setStatus("");
    setPriority("");
    setFrom("");
    setTo("");

    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
  };

  const activeFilterCount = [
    status,
    priority,
    from,
    to,
  ].filter(Boolean).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const overdueTasks = tasks.filter(
    (task) => isTaskOverdue(task)
  ).length;

  const criticalTasks = tasks.filter(
    (task) => task.priority === "CRITICAL"
  ).length;

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
            marginBottom: "26px",
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
                  d="M5 5H19V19H5V5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                <path
                  d="M8 9H16M8 13H14M8 17H12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              Task Management
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
              Tasks
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Manage, filter, and track project
              tasks from one place.
            </p>
          </div>

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

            {role === "DEVELOPER"
              ? "Developer Workspace"
              : "Task Workspace"}
          </div>
        </div>

        {/* Summary Cards */}
        <div
          className="task-summary-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <SummaryCard
            title="Total Tasks"
            value={tasks.length}
            subtitle="Tasks in current view"
            icon={
              <svg
                width="21"
                height="21"
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
            iconBackground="#eef2ff"
            iconColor="#4f46e5"
          />

          <SummaryCard
            title="Completed"
            value={completedTasks}
            subtitle="Finished tasks"
            icon={
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
            }
            iconBackground="#f0fdf4"
            iconColor="#16a34a"
          />

          <SummaryCard
            title="Overdue"
            value={overdueTasks}
            subtitle={
              overdueTasks > 0
                ? "Needs attention"
                : "Everything is on track"
            }
            icon={
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
            }
            iconBackground={
              overdueTasks > 0
                ? "#fef2f2"
                : "#f0fdf4"
            }
            iconColor={
              overdueTasks > 0
                ? "#dc2626"
                : "#16a34a"
            }
            valueColor={
              overdueTasks > 0
                ? "#dc2626"
                : "#111827"
            }
          />

          <SummaryCard
            title="Critical"
            value={criticalTasks}
            subtitle="Highest priority"
            icon={
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
            }
            iconBackground="#fff7ed"
            iconColor="#ea580c"
            valueColor={
              criticalTasks > 0
                ? "#ea580c"
                : "#111827"
            }
          />
        </div>

        {/* Filters */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "15px",
            padding: "22px",
            marginBottom: "22px",
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
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "9px",
                  backgroundColor: "#eef2ff",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6H20M7 12H17M10 18H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  Filter Tasks
                </h2>

                <p
                  style={{
                    margin: "3px 0 0",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Narrow down your task list
                </p>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 10px",
                  borderRadius: "7px",
                  backgroundColor: "#eef2ff",
                  color: "#4f46e5",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {activeFilterCount} active{" "}
                {activeFilterCount === 1
                  ? "filter"
                  : "filters"}
              </div>
            )}
          </div>

          <div
            className="task-filter-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "14px",
            }}
          >
            <FilterField label="Status">
              <select
                value={status}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setStatus(value);

                  updateUrl(
                    value,
                    priority,
                    from,
                    to
                  );
                }}
                style={filterInputStyle}
              >
                <option value="">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {formatValue(item)}
                    </option>
                  )
                )}
              </select>
            </FilterField>

            <FilterField label="Priority">
              <select
                value={priority}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setPriority(value);

                  updateUrl(
                    status,
                    value,
                    from,
                    to
                  );
                }}
                style={filterInputStyle}
              >
                <option value="">
                  All Priorities
                </option>

                {PRIORITY_OPTIONS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {formatValue(item)}
                    </option>
                  )
                )}
              </select>
            </FilterField>

            <FilterField label="Due From">
              <input
                type="date"
                value={from}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setFrom(value);

                  updateUrl(
                    status,
                    priority,
                    value,
                    to
                  );
                }}
                style={filterInputStyle}
              />
            </FilterField>

            <FilterField label="Due To">
              <input
                type="date"
                value={to}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setTo(value);

                  updateUrl(
                    status,
                    priority,
                    from,
                    value
                  );
                }}
                style={filterInputStyle}
              />
            </FilterField>
          </div>

          {activeFilterCount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "15px",
              }}
            >
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 13px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4V10H10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M20 20V14H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M18.5 9C17.3 6.1 14.5 4 11.2 4C7.2 4 4 7.2 4 11.2M5.5 15C6.7 17.9 9.5 20 12.8 20C16.8 20 20 16.8 20 12.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Task List Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "19px",
                color: "#111827",
                fontWeight: 700,
              }}
            >
              Task List
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              {tasks.length}{" "}
              {tasks.length === 1
                ? "task"
                : "tasks"}{" "}
              found
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "15px",
              padding: "55px 20px",
              textAlign: "center",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.05)",
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
                  "taskListSpin 0.8s linear infinite",
              }}
            />

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Loading tasks...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #fecaca",
              borderRadius: "15px",
              padding: "30px",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
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
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          tasks.length === 0 && (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px dashed #cbd5e1",
                borderRadius: "15px",
                padding: "60px 20px",
                textAlign: "center",
                boxShadow:
                  "0 8px 24px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  backgroundColor: "#eef2ff",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 5H19V19H5V5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M8 9H16M8 13H14M8 17H12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3
                style={{
                  margin: "0 0 7px",
                  fontSize: "17px",
                  color: "#374151",
                }}
              >
                No tasks found
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                Try changing your filters to see
                more tasks.
              </p>
            </div>
          )}

        {/* Tasks */}
        {!loading &&
          !error &&
          tasks.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {tasks.map((task) => {
                const overdue =
                  isTaskOverdue(task);

                const priorityInfo =
                  getPriorityInfo(
                    task.priority
                  );

                const statusInfo =
                  getStatusInfo(task.status);

                return (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: "#ffffff",
                      border: overdue
                        ? "1px solid #fecaca"
                        : "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "20px",
                      boxShadow:
                        "0 7px 20px rgba(15, 23, 42, 0.045)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Task information */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: "260px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              color: "#94a3b8",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            TASK #{task.id}
                          </span>

                          {overdue && (
                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "5px",
                                padding:
                                  "4px 8px",
                                borderRadius:
                                  "20px",
                                backgroundColor:
                                  "#fef2f2",
                                color:
                                  "#dc2626",
                                fontSize:
                                  "10px",
                                fontWeight:
                                  700,
                              }}
                            >
                              <span
                                style={{
                                  width: "5px",
                                  height: "5px",
                                  borderRadius:
                                    "50%",
                                  backgroundColor:
                                    "#dc2626",
                                }}
                              />

                              OVERDUE
                            </span>
                          )}
                        </div>

                        <h3
                          style={{
                            margin: "0 0 8px",
                            fontSize: "18px",
                            color: "#111827",
                            lineHeight: "1.4",
                          }}
                        >
                          {task.title}
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: "12px",
                          }}
                        >
                          Project:{" "}
                          <strong
                            style={{
                              color: "#475569",
                            }}
                          >
                            {task.project?.name ??
                              "Unknown"}
                          </strong>
                        </p>
                      </div>

                      {/* Badges */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            backgroundColor:
                              priorityInfo.background,
                            color:
                              priorityInfo.color,
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius:
                                "50%",
                              backgroundColor:
                                priorityInfo.color,
                            }}
                          />

                          {formatValue(
                            task.priority
                          )}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            backgroundColor:
                              statusInfo.background,
                            color:
                              statusInfo.color,
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {statusInfo.icon}

                          {formatValue(
                            task.status
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Task details */}
                    <div
                      className="task-detail-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "12px",
                        marginTop: "18px",
                        paddingTop: "16px",
                        borderTop:
                          "1px solid #eef0f3",
                      }}
                    >
                      <TaskDetail
                        label="Priority"
                        value={formatValue(
                          task.priority
                        )}
                        icon={
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 4V20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M5 5H17L15 9L17 13H5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                      />

                      <TaskDetail
                        label="Due Date"
                        value={new Date(
                          task.dueDate
                        ).toLocaleDateString()}
                        valueColor={
                          overdue
                            ? "#dc2626"
                            : "#374151"
                        }
                        icon={
                          <svg
                            width="15"
                            height="15"
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
                          </svg>
                        }
                      />

                      <TaskDetail
                        label="Developer"
                        value={
                          task.developer?.name ??
                          "Unassigned"
                        }
                        icon={
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="12"
                              cy="8"
                              r="3.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />

                            <path
                              d="M5 20C5.5 16.8 8.2 15 12 15C15.8 15 18.5 16.8 19 20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        }
                      />
                    </div>

                    {/* Action */}
                    <div
                      style={{
                        marginTop: "17px",
                        paddingTop: "15px",
                        borderTop:
                          "1px solid #eef0f3",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      {role ===
                      "DEVELOPER" ? (
                        <div>
                          <p
                            style={{
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            Update task status
                          </p>

                          <div
                            style={{
                              position:
                                "relative",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                            }}
                          >
                            <select
                              value={
                                task.status
                              }
                              onChange={(
                                event
                              ) =>
                                handleStatusChange(
                                  task.id,
                                  event.target
                                    .value
                                )
                              }
                              disabled={
                                task.status ===
                                  "DONE" ||
                                updatingTaskId ===
                                  task.id
                              }
                              style={{
                                ...statusSelectStyle,
                                opacity:
                                  task.status ===
                                    "DONE" ||
                                  updatingTaskId ===
                                    task.id
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {STATUS_OPTIONS.map(
                                (item) => (
                                  <option
                                    key={
                                      item
                                    }
                                    value={
                                      item
                                    }
                                  >
                                    {formatValue(
                                      item
                                    )}
                                  </option>
                                )
                              )}
                            </select>

                            {updatingTaskId ===
                              task.id && (
                              <span
                                style={{
                                  position:
                                    "absolute",
                                  right: "10px",
                                  width: "14px",
                                  height: "14px",
                                  border:
                                    "2px solid #cbd5e1",
                                  borderTopColor:
                                    "#4f46e5",
                                  borderRadius:
                                    "50%",
                                  animation:
                                    "taskStatusSpin 0.8s linear infinite",
                                }}
                              />
                            )}
                          </div>

                          {task.status ===
                            "DONE" && (
                            <p
                              style={{
                                margin:
                                  "6px 0 0",
                                color:
                                  "#16a34a",
                                fontSize:
                                  "10px",
                              }}
                            >
                              This task is completed.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            color:
                              "#94a3b8",
                            fontSize:
                              "11px",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
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
                              d="M12 11V16"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <circle
                              cx="12"
                              cy="8"
                              r="1"
                              fill="currentColor"
                            />
                          </svg>

                          Status changes are managed
                          by authorized users.
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "6px",
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

                        Due{" "}
                        {new Date(
                          task.dueDate
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      <style>
        {`
          @keyframes taskListSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes taskStatusSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          select:focus,
          input:focus {
            border-color: #6366f1 !important;
            background-color: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
            outline: none;
          }

          button {
            transition: all 0.2s ease;
          }

          button:hover {
            border-color: #cbd5e1;
            background-color: #f8fafc !important;
          }

          select,
          input {
            transition: all 0.2s ease;
          }

          @media (max-width: 950px) {
            .task-summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .task-filter-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 650px) {
            .task-summary-grid {
              grid-template-columns: 1fr !important;
            }

            .task-filter-grid {
              grid-template-columns: 1fr !important;
            }

            .task-detail-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* -------------------------------- */
/* Summary Card */
/* -------------------------------- */

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBackground: string;
  iconColor: string;
  valueColor?: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor = "#111827",
}: SummaryCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "18px",
        boxShadow:
          "0 7px 20px rgba(15, 23, 42, 0.045)",
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
              margin: "0 0 7px",
              color: "#64748b",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {title}
          </p>

          <p
            style={{
              margin: 0,
              color: valueColor,
              fontSize: "28px",
              lineHeight: 1,
              fontWeight: 750,
            }}
          >
            {value}
          </p>
        </div>

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            backgroundColor: iconBackground,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>

      <p
        style={{
          margin: "12px 0 0",
          color: "#94a3b8",
          fontSize: "10px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* -------------------------------- */
/* Filter Field */
/* -------------------------------- */

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

function FilterField({
  label,
  children,
}: FilterFieldProps) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          color: "#475569",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/* -------------------------------- */
/* Task Detail */
/* -------------------------------- */

interface TaskDetailProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueColor?: string;
}

function TaskDetail({
  label,
  value,
  icon,
  valueColor = "#374151",
}: TaskDetailProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "10px 12px",
        borderRadius: "9px",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: "0 0 2px",
            color: "#94a3b8",
            fontSize: "9px",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: 0,
            color: valueColor,
            fontSize: "12px",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Styles */
/* -------------------------------- */

const filterInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  color: "#374151",
  fontSize: "12px",
  outline: "none",
  cursor: "pointer",
};

const statusSelectStyle: React.CSSProperties = {
  minWidth: "180px",
  padding: "9px 34px 9px 11px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "12px",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

/* -------------------------------- */
/* Helpers */
/* -------------------------------- */

function getPriorityInfo(priority: string) {
  switch (priority) {
    case "LOW":
      return {
        color: "#16a34a",
        background: "#f0fdf4",
      };

    case "MEDIUM":
      return {
        color: "#ca8a04",
        background: "#fefce8",
      };

    case "HIGH":
      return {
        color: "#ea580c",
        background: "#fff7ed",
      };

    case "CRITICAL":
      return {
        color: "#dc2626",
        background: "#fef2f2",
      };

    default:
      return {
        color: "#64748b",
        background: "#f1f5f9",
      };
  }
}

function getStatusInfo(status: string) {
  switch (status) {
    case "TODO":
      return {
        color: "#475569",
        background: "#f1f5f9",
        icon: (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "currentColor",
            }}
          />
        ),
      };

    case "IN_PROGRESS":
      return {
        color: "#2563eb",
        background: "#eff6ff",
        icon: (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "currentColor",
            }}
          />
        ),
      };

    case "IN_REVIEW":
      return {
        color: "#ea580c",
        background: "#fff7ed",
        icon: (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "currentColor",
            }}
          />
        ),
      };

    case "DONE":
      return {
        color: "#16a34a",
        background: "#f0fdf4",
        icon: (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "currentColor",
            }}
          />
        ),
      };

    default:
      return {
        color: "#4f46e5",
        background: "#eef2ff",
        icon: (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "currentColor",
            }}
          />
        ),
      };
  }
}

function isTaskOverdue(task: Task) {
  if (task.status === "DONE") {
    return false;
  }

  return (
    new Date(task.dueDate).getTime() <
    new Date().getTime()
  );
}

function formatValue(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}