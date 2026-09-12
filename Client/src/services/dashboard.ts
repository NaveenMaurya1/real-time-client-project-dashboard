export interface AdminDashboardData {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  overdueTasks: number;
}

const API_URL = "http://localhost:5000";

export const getAdminDashboard = async (
  accessToken: string
): Promise<AdminDashboardData> => {
  const response = await fetch(
    `${API_URL}/api/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  const result = await response.json();

  return result.data;
};

export interface ProjectManagerDashboardData {
  totalProjects: number;
  totalTasks: number;
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  dueThisWeek: number;
  overdueTasks: number;
}

export const getProjectManagerDashboard =
  async (
    accessToken: string
  ): Promise<ProjectManagerDashboardData> => {
    const response = await fetch(
      `${API_URL}/api/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch PM dashboard"
      );
    }

    const result = await response.json();

    return result.data;
  };

  export interface DeveloperDashboardData {
  totalAssigned: number;

  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };

  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };

  overdueTasks: number;
}

export const getDeveloperDashboard =
  async (
    accessToken: string
  ): Promise<DeveloperDashboardData> => {
    const response = await fetch(
      `${API_URL}/api/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch developer dashboard"
      );
    }

    const result = await response.json();

    return result.data;
  };