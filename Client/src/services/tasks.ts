export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  assignedDeveloperId: number;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;

  project?: {
    id: number;
    name: string;
  };

  developer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Developer {
  id: number;
  name: string;
  email: string;
}

export interface CreateTaskInput {
  projectId: number;
  title: string;
  description?: string;
  assignedDeveloperId: number;
  priority: string;
  dueDate: string;
}

interface GetTasksFilters {
  status?: string;
  priority?: string;
  from?: string;
  to?: string;
}

const API_URL = "http://localhost:5000";

export const getTasks = async (
  accessToken: string,
  filters: GetTasksFilters = {}
): Promise<Task[]> => {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_URL}/api/tasks?${queryString}`
    : `${API_URL}/api/tasks`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const result = await response.json();

  return result.data;
};

export const updateTaskStatus = async (
  accessToken: string,
  taskId: number,
  status: string
): Promise<Task> => {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    const result = await response.json();

    throw new Error(
      result?.error?.message ||
        "Failed to update task status"
    );
  }

  const result = await response.json();

  return result.data.updatedTask;
};

export const getDevelopers = async (
  accessToken: string
): Promise<Developer[]> => {
  const response = await fetch(
    `${API_URL}/api/users/developers`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch developers");
  }

  const result = await response.json();

  return result.data.developers;
};

export const createTask = async (
  accessToken: string,
  data: CreateTaskInput
): Promise<Task> => {
  const response = await fetch(
    `${API_URL}/api/projects/${data.projectId}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        assignedDeveloperId: data.assignedDeveloperId,
        priority: data.priority,
        dueDate: data.dueDate,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Failed to create task"
    );
  }

  return result.data.task;
};