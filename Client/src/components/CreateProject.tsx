import { useEffect, useState } from "react";

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

  return (
    <div>
      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Project Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter project name"
            disabled={creating}
          />
        </div>

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
            placeholder="Enter project description"
            disabled={creating}
          />
        </div>

        <div>
          <label>
            Client
          </label>

          {loadingClients ? (
            <p>Loading clients...</p>
          ) : (
            <select
              value={clientId}
              onChange={(event) =>
                setClientId(
                  event.target.value
                )
              }
              disabled={creating}
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
        </div>

        {error && (
          <p>{error}</p>
        )}

        {success && (
          <p>{success}</p>
        )}

        <button
          type="submit"
          disabled={
            creating ||
            loadingClients
          }
        >
          {creating
            ? "Creating..."
            : "Create Project"}
        </button>
      </form>
    </div>
  );
}