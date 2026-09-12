import { useEffect, useState } from "react";

import {
  getDeveloperDashboard,
} from "../services/dashboard";

import type {
  DeveloperDashboardData,
} from "../services/dashboard";

interface DeveloperDashboardProps {
  accessToken: string;
}

export default function DeveloperDashboard({
  accessToken,
}: DeveloperDashboardProps) {
  const [dashboard, setDashboard] =
    useState<DeveloperDashboardData | null>(
      null
    );

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
          await getDeveloperDashboard(
            accessToken
          );

        setDashboard(data);
      } catch (error) {
        console.error(
          "Developer dashboard error:",
          error
        );

        setError(
          "Failed to load dashboard"
        );
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
    return (
      <p>
        No dashboard data available.
      </p>
    );
  }

  return (
    <div>
      <h1>Developer Dashboard</h1>

      <div>
        <div>
          <h3>My Assigned Tasks</h3>
          <p>{dashboard.totalAssigned}</p>
        </div>

        <div>
          <h3>Overdue Tasks</h3>
          <p>{dashboard.overdueTasks}</p>
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

      <hr />

      <h2>Tasks by Priority</h2>

      <div>
        <p>
          Critical:{" "}
          {dashboard.tasksByPriority.CRITICAL}
        </p>

        <p>
          High:{" "}
          {dashboard.tasksByPriority.HIGH}
        </p>

        <p>
          Medium:{" "}
          {dashboard.tasksByPriority.MEDIUM}
        </p>

        <p>
          Low:{" "}
          {dashboard.tasksByPriority.LOW}
        </p>
      </div>
    </div>
  );
}