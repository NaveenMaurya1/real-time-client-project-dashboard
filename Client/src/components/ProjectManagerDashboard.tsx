import { useEffect, useState } from "react";

import {
  getProjectManagerDashboard,
} from "../services/dashboard";

import type {
  ProjectManagerDashboardData,
} from "../services/dashboard";

interface ProjectManagerDashboardProps {
  accessToken: string;
}

export default function ProjectManagerDashboard({
  accessToken,
}: ProjectManagerDashboardProps) {
  const [dashboard, setDashboard] =
    useState<ProjectManagerDashboardData | null>(
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
          await getProjectManagerDashboard(
            accessToken
          );

        setDashboard(data);
      } catch (error) {
        console.error(
          "PM dashboard error:",
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
      <h1>Project Manager Dashboard</h1>

      <div>
        <div>
          <h3>My Projects</h3>
          <p>{dashboard.totalProjects}</p>
        </div>

        <div>
          <h3>My Tasks</h3>
          <p>{dashboard.totalTasks}</p>
        </div>

        <div>
          <h3>Due This Week</h3>
          <p>{dashboard.dueThisWeek}</p>
        </div>

        <div>
          <h3>Overdue Tasks</h3>
          <p>{dashboard.overdueTasks}</p>
        </div>
      </div>

      <hr />

      <h2>Tasks by Priority</h2>

      <div>
        <p>
          Low:{" "}
          {dashboard.tasksByPriority.LOW}
        </p>

        <p>
          Medium:{" "}
          {dashboard.tasksByPriority.MEDIUM}
        </p>

        <p>
          High:{" "}
          {dashboard.tasksByPriority.HIGH}
        </p>

        <p>
          Critical:{" "}
          {dashboard.tasksByPriority.CRITICAL}
        </p>
      </div>
    </div>
  );
}