import { useEffect, useState } from "react";

import { getAdminDashboard } from "../services/dashboard";
import type { AdminDashboardData } from "../services/dashboard";

interface AdminDashboardProps {
  accessToken: string;
  onlineUsers: number;
}

export default function AdminDashboard({
  accessToken,
  onlineUsers,
}: AdminDashboardProps) {
  const [dashboard, setDashboard] =
    useState<AdminDashboardData | null>(null);

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
          await getAdminDashboard(accessToken);

        setDashboard(data);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      loadDashboard();
    }
  }, [accessToken]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div>
        <div>
          <h3>Total Projects</h3>
          <p>{dashboard.totalProjects}</p>
        </div>

        <div>
          <h3>Total Tasks</h3>
          <p>{dashboard.totalTasks}</p>
        </div>

        <div>
          <h3>Overdue Tasks</h3>
          <p>{dashboard.overdueTasks}</p>
        </div>

        <div>
          <h3>Online Users</h3>
          <p>🟢 {onlineUsers}</p>
        </div>
      </div>

      <hr />

      <h2>Tasks by Status</h2>

      <div>
        <p>
          To Do:{" "}
          {dashboard.tasksByStatus.TODO}
        </p>

        <p>
          In Progress:{" "}
          {dashboard.tasksByStatus.IN_PROGRESS}
        </p>

        <p>
          In Review:{" "}
          {dashboard.tasksByStatus.IN_REVIEW}
        </p>

        <p>
          Done:{" "}
          {dashboard.tasksByStatus.DONE}
        </p>
      </div>
    </div>
  );
}