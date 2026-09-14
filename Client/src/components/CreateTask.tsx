import {
  useEffect,
  useState,
} from "react";

import {
  createTask,
  getDevelopers,
} from "../services/tasks";

import {
  getProjects,
} from "../services/projects";

import type {
  Developer,
} from "../services/tasks";

import type {
  Project,
} from "../services/projects";

interface CreateTaskProps {
  accessToken: string;
  onTaskCreated: () => void;
}

const PRIORITY_OPTIONS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export default function CreateTask({
  accessToken,
  onTaskCreated,
}: CreateTaskProps) {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [developers, setDevelopers] =
    useState<Developer[]>([]);

  const [projectId, setProjectId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [assignedDeveloperId, setAssignedDeveloperId] =
    useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [dueDate, setDueDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  /*
   * ============================
   * LOAD PROJECTS + DEVELOPERS
   * ============================
   */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        const [
          projectData,
          developerData,
        ] = await Promise.all([
          getProjects(accessToken),
          getDevelopers(accessToken),
        ]);

        setProjects(projectData);
        setDevelopers(developerData);
      } catch (error) {
        console.error(
          "Failed to load task form data:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load projects and developers"
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  /*
   * ============================
   * CREATE TASK
   * ============================
   */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!projectId) {
        throw new Error(
          "Please select a project"
        );
      }

      if (!assignedDeveloperId) {
        throw new Error(
          "Please select a developer"
        );
      }

      if (!dueDate) {
        throw new Error(
          "Please select a due date"
        );
      }

      await createTask(
        accessToken,
        {
          projectId: Number(projectId),
          title,
          description:
            description || undefined,
          assignedDeveloperId:
            Number(assignedDeveloperId),
          priority,
          dueDate,
        }
      );

      setTitle("");
      setDescription("");
      setAssignedDeveloperId("");
      setPriority("MEDIUM");
      setDueDate("");

      setSuccess(
        "Task created successfully"
      );

      onTaskCreated();
    } catch (error) {
      console.error(
        "Failed to create task:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================
   * LOADING
   * ============================
   */

  if (loadingData) {
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
            backgroundColor: "white",
            padding: "35px",
            borderRadius: "14px",
            textAlign: "center",
            boxShadow:
              "0 8px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              border:
                "4px solid #e2e8f0",
              borderTop:
                "4px solid #2563eb",
              borderRadius: "50%",
              margin:
                "0 auto 15px",
              animation:
                "createTaskSpin 1s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Loading projects and developers...
          </p>
        </div>

        <style>
          {`
            @keyframes createTaskSpin {
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
   * ============================
   * FORM
   * ============================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "35px 20px",
        boxSizing: "border-box",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* ============================
            PAGE HEADER
            ============================ */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Project Management
          </p>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "30px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Create New Task
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Create a task and assign it to a
            developer with a priority and deadline.
          </p>
        </div>

        {/* ============================
            FORM CARD
            ============================ */}

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            border:
              "1px solid #e2e8f0",
            boxShadow:
              "0 8px 30px rgba(15, 23, 42, 0.06)",
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: "22px 26px",
              borderBottom:
                "1px solid #e2e8f0",
              background:
                "linear-gradient(135deg, #f8fafc, #ffffff)",
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
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor:
                    "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                    d="M12 5V19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M5 12H19"
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
                    color: "#0f172a",
                  }}
                >
                  Task Details
                </h2>

                <p
                  style={{
                    margin:
                      "3px 0 0",
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  Fill in the task information
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "26px",
            }}
          >
            {/* ============================
                ALERTS
                ============================ */}

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "13px 15px",
                  marginBottom: "20px",
                  borderRadius: "9px",
                  backgroundColor: "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                  }}
                >
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "13px 15px",
                  marginBottom: "20px",
                  borderRadius: "9px",
                  backgroundColor: "#f0fdf4",
                  border:
                    "1px solid #bbf7d0",
                  color: "#15803d",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                  }}
                >
                  ✓
                </span>

                <span>{success}</span>
              </div>
            )}

            {/* ============================
                PROJECT + DEVELOPER
                ============================ */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Project */}
              <div>
                <label
                  htmlFor="project"
                  style={labelStyle}
                >
                  Project
                  <span
                    style={{
                      color: "#ef4444",
                      marginLeft: "3px",
                    }}
                  >
                    *
                  </span>
                </label>

                <select
                  id="project"
                  value={projectId}
                  onChange={(event) =>
                    setProjectId(
                      event.target.value
                    )
                  }
                  required
                  style={inputStyle}
                >
                  <option value="">
                    Select Project
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        #{project.id}{" "}
                        {project.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Developer */}
              <div>
                <label
                  htmlFor="developer"
                  style={labelStyle}
                >
                  Assign Developer
                  <span
                    style={{
                      color: "#ef4444",
                      marginLeft: "3px",
                    }}
                  >
                    *
                  </span>
                </label>

                <select
                  id="developer"
                  value={
                    assignedDeveloperId
                  }
                  onChange={(event) =>
                    setAssignedDeveloperId(
                      event.target.value
                    )
                  }
                  required
                  style={inputStyle}
                >
                  <option value="">
                    Select Developer
                  </option>

                  {developers.map(
                    (developer) => (
                      <option
                        key={developer.id}
                        value={developer.id}
                      >
                        {developer.name} (
                        {developer.email})
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* ============================
                TITLE
                ============================ */}

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label
                htmlFor="title"
                style={labelStyle}
              >
                Task Title
                <span
                  style={{
                    color: "#ef4444",
                    marginLeft: "3px",
                  }}
                >
                  *
                </span>
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Implement user authentication"
                required
                style={inputStyle}
              />
            </div>

            {/* ============================
                DESCRIPTION
                ============================ */}

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label
                htmlFor="description"
                style={labelStyle}
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what needs to be completed..."
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "120px",
                  lineHeight: "1.5",
                }}
              />

              <p
                style={{
                  margin:
                    "6px 0 0",
                  fontSize: "11px",
                  color: "#94a3b8",
                }}
              >
                Add useful details to help the
                developer understand the task.
              </p>
            </div>

            {/* ============================
                PRIORITY + DUE DATE
                ============================ */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  style={labelStyle}
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  style={inputStyle}
                >
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
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="dueDate"
                  style={labelStyle}
                >
                  Due Date
                  <span
                    style={{
                      color: "#ef4444",
                      marginLeft: "3px",
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* ============================
                FORM FOOTER
                ============================ */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                alignItems: "center",
                gap: "12px",
                paddingTop: "20px",
                borderTop:
                  "1px solid #e2e8f0",
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  minWidth: "145px",
                  padding:
                    "12px 20px",
                  border: "none",
                  borderRadius: "9px",
                  background: loading
                    ? "#93c5fd"
                    : "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 6px 16px rgba(37, 99, 235, 0.22)",
                  transition:
                    "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: "15px",
                        height: "15px",
                        border:
                          "2px solid rgba(255,255,255,0.4)",
                        borderTop:
                          "2px solid white",
                        borderRadius:
                          "50%",
                        animation:
                          "createTaskSpin 0.8s linear infinite",
                      }}
                    />

                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          @keyframes createTaskSpin {
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
 * ============================
 * SHARED INPUT STYLES
 * ============================
 */

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  color: "#111827",
  backgroundColor: "#f9fafb",
  fontFamily: "inherit",
};

/*
 * ============================
 * FORMAT ENUM VALUES
 * ============================
 */

function formatValue(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}
