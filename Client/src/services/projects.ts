export interface Client {
  id: number;
  name: string;
  email: string;
  company: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  clientId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const getClients = async (
  accessToken: string
): Promise<Client[]> => {
  const response = await fetch(
    `${API_URL}/api/clients`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }

  const result = await response.json();

  return result.data.clients;
};

export const createProject = async (
  accessToken: string,
  data: {
    name: string;
    description?: string;
    clientId: number;
  }
): Promise<Project> => {
  const response = await fetch(
    `${API_URL}/api/projects`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to create project"
    );
  }

  return result.data.project;
};

export const getProjects = async (
  accessToken: string
): Promise<Project[]> => {
  const response = await fetch(
    `${API_URL}/api/projects`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to fetch projects"
    );
  }

  return result.data.projects;
};