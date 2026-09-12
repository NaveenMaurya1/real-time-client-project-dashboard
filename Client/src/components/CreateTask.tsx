
import {
  useEffect,
  useState,
} from "react";

import {
  createTask,
} from "../services/tasks";

import {
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
      <div>
        <h2>Create Task</h2>
        <p>
          Loading projects and developers...
        </p>
      </div>
    );
  }

  /*
   * ============================
   * FORM
   * ============================
   */

  return (
    <div>
      <h2>Create Task</h2>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: "green" }}>
          {success}
        </p>
      )}

      {projects.length === 0 ? (
        <p>
          No projects are available for you.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* PROJECT */}

          <div>
            <label>
              Project
            </label>

            <select
              value={projectId}
              onChange={(event) =>
                setProjectId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select Project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  #{project.id}{" "}
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}

          <div>
            <label>
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Task title"
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Task description"
            />
          </div>

          {/* DEVELOPER */}

          <div>
            <label>
              Assign Developer
            </label>

            <select
              value={
                assignedDeveloperId
              }
              onChange={(event) =>
                setAssignedDeveloperId(
                  event.target.value
                )
              }
              required
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

          {/* PRIORITY */}

          <div>
            <label>
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value
                )
              }
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

          {/* DUE DATE */}

          <div>
            <label>
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value
                )
              }
              required
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Task"}
          </button>
        </form>
      )}
    </div>
  );
}

function formatValue(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

