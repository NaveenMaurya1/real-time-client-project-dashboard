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

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/**
 * Safely extracts an API error message.
 */
const getErrorMessage = (
  result: unknown,
  fallback: string
): string => {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result
  ) {
    const error = (result as {
      error?: {
        message?: unknown;
      };
    }).error;

    if (
      error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
  }

  return fallback;
};

/**
 * Fetch all tasks available to the authenticated user.
 *
 * The backend may return either:
 *
 * {
 *   success: true,
 *   data: [...]
 * }
 *
 * or:
 *
 * {
 *   success: true,
 *   data: {
 *     tasks: [...]
 *   }
 * }
 *
 * This function normalizes both responses into Task[].
 */
export const getTasks = async (
  accessToken: string,
  filters: GetTasksFilters = {}
): Promise<Task[]> => {
  if (!accessToken) {
    throw new Error(
      "Authentication token is required"
    );
  }

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
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response"
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to fetch tasks"
      )
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result)
  ) {
    throw new Error(
      "Invalid tasks response from server"
    );
  }

  const data = (result as {
    data?: unknown;
  }).data;

  /*
   * Backend response:
   *
   * data: [...]
   */
  if (Array.isArray(data)) {
    return data as Task[];
  }

  /*
   * Backend response:
   *
   * data: {
   *   tasks: [...]
   * }
   */
  if (
    typeof data === "object" &&
    data !== null &&
    "tasks" in data
  ) {
    const tasks = (data as {
      tasks?: unknown;
    }).tasks;

    if (Array.isArray(tasks)) {
      return tasks as Task[];
    }
  }

  throw new Error(
    "Invalid tasks response from server"
  );
};

/**
 * Update the status of a task.
 */
export const updateTaskStatus = async (
  accessToken: string,
  taskId: number,
  status: string
): Promise<Task> => {
  if (!accessToken) {
    throw new Error(
      "Authentication token is required"
    );
  }

  if (!Number.isInteger(taskId)) {
    throw new Error("Invalid task ID");
  }

  if (!status.trim()) {
    throw new Error("Task status is required");
  }

  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status,
      }),
    }
  );

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response"
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to update task status"
      )
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result)
  ) {
    throw new Error(
      "Invalid task update response from server"
    );
  }

  const data = (result as {
    data?: unknown;
  }).data;

  if (
    typeof data === "object" &&
    data !== null &&
    "updatedTask" in data
  ) {
    const updatedTask = (data as {
      updatedTask?: unknown;
    }).updatedTask;

    if (updatedTask) {
      return updatedTask as Task;
    }
  }

  /*
   * Also support an API that directly returns:
   *
   * data: {
   *   ...task
   * }
   */
  if (
    typeof data === "object" &&
    data !== null &&
    "id" in data
  ) {
    return data as Task;
  }

  throw new Error(
    "Invalid updated task response from server"
  );
};

/**
 * Fetch all developers available to the authenticated user.
 */
export const getDevelopers = async (
  accessToken: string
): Promise<Developer[]> => {
  if (!accessToken) {
    throw new Error(
      "Authentication token is required"
    );
  }

  const response = await fetch(
    `${API_URL}/api/users/developers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response"
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to fetch developers"
      )
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result)
  ) {
    throw new Error(
      "Invalid developers response from server"
    );
  }

  const data = (result as {
    data?: unknown;
  }).data;

  /*
   * Expected response:
   *
   * data: {
   *   developers: [...]
   * }
   */
  if (
    typeof data === "object" &&
    data !== null &&
    "developers" in data
  ) {
    const developers = (data as {
      developers?: unknown;
    }).developers;

    if (Array.isArray(developers)) {
      return developers as Developer[];
    }
  }

  /*
   * Also support:
   *
   * data: [...]
   */
  if (Array.isArray(data)) {
    return data as Developer[];
  }

  throw new Error(
    "Invalid developers response from server"
  );
};

/**
 * Create a new task inside a project.
 */
export const createTask = async (
  accessToken: string,
  data: CreateTaskInput
): Promise<Task> => {
  if (!accessToken) {
    throw new Error(
      "Authentication token is required"
    );
  }

  if (!Number.isInteger(data.projectId)) {
    throw new Error("Invalid project ID");
  }

  if (!data.title.trim()) {
    throw new Error("Task title is required");
  }

  if (!Number.isInteger(data.assignedDeveloperId)) {
    throw new Error(
      "A valid developer is required"
    );
  }

  if (!data.priority.trim()) {
    throw new Error("Task priority is required");
  }

  if (!data.dueDate) {
    throw new Error("Task due date is required");
  }

  const response = await fetch(
    `${API_URL}/api/projects/${data.projectId}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: data.title.trim(),
        description:
          data.description?.trim() || undefined,
        assignedDeveloperId:
          data.assignedDeveloperId,
        priority: data.priority,
        dueDate: data.dueDate,
      }),
    }
  );

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response"
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        "Failed to create task"
      )
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result)
  ) {
    throw new Error(
      "Invalid task creation response from server"
    );
  }

  const responseData = (result as {
    data?: unknown;
  }).data;

  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "task" in responseData
  ) {
    const task = (responseData as {
      task?: unknown;
    }).task;

    if (task) {
      return task as Task;
    }
  }

  /*
   * Also support:
   *
   * data: task
   */
  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "id" in responseData
  ) {
    return responseData as Task;
  }

  throw new Error(
    "Invalid created task response from server"
  );
};