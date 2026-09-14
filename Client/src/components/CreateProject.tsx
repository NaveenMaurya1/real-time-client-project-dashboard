import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

import {
  createProject,
  getClients,
} from "../services/projects";

import type { Client } from "../services/projects";

interface CreateProjectProps {
  accessToken: string;
  onProjectCreated?: () => void;
}

export default function CreateProject({
  accessToken,
  onProjectCreated,
}: CreateProjectProps) {
  const [clients, setClients] = useState<Client[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [clientId, setClientId] =
    useState("");

  const [loadingClients, setLoadingClients] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        setError(null);

        const data = await getClients(accessToken);

        setClients(data);
      } catch (error) {
        console.error(
          "Failed to load clients:",
          error
        );

        setError("Failed to load clients");
      } finally {
        setLoadingClients(false);
      }
    };

    if (accessToken) {
      loadClients();
    }
  }, [accessToken]);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!clientId) {
      setError("Please select a client");
      return;
    }

    try {
      setCreating(true);

      await createProject(accessToken, {
        name: name.trim(),
        description:
          description.trim() || undefined,
        clientId: Number(clientId),
      });

      setName("");
      setDescription("");
      setClientId("");

      setSuccess(
        "Project created successfully"
      );

      onProjectCreated?.();
    } catch (error) {
      console.error(
        "Failed to create project:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project"
      );
    } finally {
      setCreating(false);
    }
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    outline: "none",
    fontSize: "14px",
    color: "#111827",
    backgroundColor: "#f9fafb",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* Page Heading */}
        <div
          style={{
            marginBottom: "24px",
          }}
        >
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
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            Project Management
          </div>

          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "32px",
              lineHeight: "1.2",
              fontWeight: 750,
              color: "#111827",
            }}
          >
            Create New Project
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            Create a project and assign it to
            one of your clients.
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 12px 35px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: "22px 26px",
              borderBottom: "1px solid #eef0f3",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #4f46e5, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow:
                  "0 6px 14px rgba(79, 70, 229, 0.25)",
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
                  d="M4 7.5C4 6.67 4.67 6 5.5 6H10L12 8H18.5C19.33 8 20 8.67 20 9.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V7.5Z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />

                <path
                  d="M12 11V16M9.5 13.5H14.5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Project Details
              </h2>

              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                Enter the basic information for
                your new project.
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "26px",
            }}
          >
            {/* Alerts */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  borderRadius: "9px",
                  border:
                    "1px solid #fecaca",
                  backgroundColor: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: "14px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M12 8V12"
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

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  borderRadius: "9px",
                  border:
                    "1px solid #bbf7d0",
                  backgroundColor: "#f0fdf4",
                  color: "#15803d",
                  fontSize: "14px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M8 12.5L10.5 15L16 9.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>{success}</span>
              </div>
            )}

            {/* Project Name + Client */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Project Name */}
              <div>
                <label
                  htmlFor="project-name"
                  style={labelStyle}
                >
                  Project Name
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. E-commerce Dashboard"
                  disabled={creating}
                  style={inputStyle}
                />

                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  Give your project a clear and
                  recognizable name.
                </p>
              </div>

              {/* Client */}
              <div>
                <label
                  htmlFor="project-client"
                  style={labelStyle}
                >
                  Client
                </label>

                {loadingClients ? (
                  <div
                    style={{
                      ...inputStyle,
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      color: "#6b7280",
                    }}
                  >
                    <span
                      style={{
                        width: "15px",
                        height: "15px",
                        border:
                          "2px solid #d1d5db",
                        borderTopColor:
                          "#4f46e5",
                        borderRadius: "50%",
                        animation:
                          "createProjectSpin 0.8s linear infinite",
                      }}
                    />

                    Loading clients...
                  </div>
                ) : (
                  <select
                    id="project-client"
                    value={clientId}
                    onChange={(event) =>
                      setClientId(
                        event.target.value
                      )
                    }
                    disabled={creating}
                    style={{
                      ...inputStyle,
                      cursor: creating
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    <option value="">
                      Select a client
                    </option>

                    {clients.map((client) => (
                      <option
                        key={client.id}
                        value={client.id}
                      >
                        {client.company} -{" "}
                        {client.name}
                      </option>
                    ))}
                  </select>
                )}

                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  Select the client associated
                  with this project.
                </p>
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <label
                htmlFor="project-description"
                style={labelStyle}
              >
                Description
                <span
                  style={{
                    marginLeft: "5px",
                    fontWeight: 400,
                    color: "#9ca3af",
                  }}
                >
                  (Optional)
                </span>
              </label>

              <textarea
                id="project-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the project, its goals, requirements, or other important details..."
                disabled={creating}
                rows={6}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "140px",
                  lineHeight: "1.6",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                <span>
                  Add useful information for your
                  project team.
                </span>

                <span>
                  {description.length} characters
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                backgroundColor: "#eef0f3",
                marginBottom: "22px",
              }}
            />

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setDescription("");
                  setClientId("");
                  setError(null);
                  setSuccess(null);
                }}
                disabled={creating}
                style={{
                  padding: "11px 18px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  cursor: creating
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: creating ? 0.6 : 1,
                }}
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={
                  creating ||
                  loadingClients
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  minWidth: "160px",
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color: "#ffffff",
                  cursor:
                    creating ||
                    loadingClients
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow:
                    "0 6px 14px rgba(79, 70, 229, 0.25)",
                  opacity:
                    creating ||
                    loadingClients
                      ? 0.65
                      : 1,
                }}
              >
                {creating ? (
                  <>
                    <span
                      style={{
                        width: "15px",
                        height: "15px",
                        border:
                          "2px solid rgba(255,255,255,0.4)",
                        borderTopColor:
                          "#ffffff",
                        borderRadius: "50%",
                        animation:
                          "createProjectSpin 0.8s linear infinite",
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
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            marginTop: "18px",
            color: "#9ca3af",
            fontSize: "12px",
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
              r="9"
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

          You can manage project tasks after
          creating the project.
        </div>
      </div>

      <style>
        {`
          @keyframes createProjectSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          input:focus,
          textarea:focus,
          select:focus {
            border-color: #6366f1 !important;
            background-color: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          button {
            transition: all 0.2s ease;
          }
        `}
      </style>
    </div>
  );
}