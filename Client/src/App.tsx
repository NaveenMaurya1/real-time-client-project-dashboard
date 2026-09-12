import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ActivityFeed from "./components/ActivityFeed";
import NotificationBell from "./components/NotificationBell";
import OnlineUsers from "./components/OnlineUsers";

import AdminDashboard from "./components/AdminDashboard";
import ProjectManagerDashboard from "./components/ProjectManagerDashboard";
import DeveloperDashboard from "./components/DeveloperDashboard";

import TaskList from "./components/TaskList";
import CreateProject from "./components/CreateProject";
import CreateTask from "./components/CreateTask";

import Login from "./components/Login";

import {
  getCurrentUser,
  logout,
  refreshAccessToken,
} from "./services/auth";

import type { User } from "./services/auth";

import "./App.css";

function App() {
  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [loadingSession, setLoadingSession] =
    useState(true);

  const [onlineUsers, setOnlineUsers] =
    useState(0);

  const [taskRefreshKey, setTaskRefreshKey] =
    useState(0);

  /*
   * ============================
   * RESTORE SESSION
   * ============================
   */

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const newAccessToken =
          await refreshAccessToken();

        const currentUser =
          await getCurrentUser(
            newAccessToken
          );

        setAccessToken(newAccessToken);
        setUser(currentUser);
      } catch (error) {
        console.log(
          "No active session found"
        );
      } finally {
        setLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  /*
   * ============================
   * LOGIN
   * ============================
   */

  const handleLogin = (
    token: string,
    loggedInUser: User
  ) => {
    setAccessToken(token);
    setUser(loggedInUser);
  };

  /*
   * ============================
   * LOGOUT
   * ============================
   */

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  /*
   * ============================
   * ONLINE USERS
   * ============================
   */

  const handleOnlineUsersChange =
    useCallback((count: number) => {
      setOnlineUsers(count);
    }, []);

  /*
   * ============================
   * TASK CREATED
   * ============================
   */

  const handleTaskCreated = () => {
    setTaskRefreshKey(
      (value) => value + 1
    );
  };

  /*
   * ============================
   * SESSION LOADING
   * ============================
   */

  if (loadingSession) {
    return (
      <div className="app">
        <main className="dashboard-container">
          <section className="section">
            <h1 >
              Client Project Dashboard
            </h1>

            <p>
              Checking your session...
            </p>
          </section>
        </main>
      </div>
    );
  }

  /*
   * ============================
   * LOGIN SCREEN
   * ============================
   */

  if (!accessToken || !user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  /*
   * ============================
   * AUTHENTICATED APPLICATION
   * ============================
   */

  return (
    <div className="app">

      {/* ============================
          HEADER
          ============================ */}

      <header className="app-header">
        <div>
          <h1>
            Client Project Dashboard
          </h1>

          <p>
            Welcome, {user.name}
          </p>

          <p>
            Role: {user.role}
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-container">

        {/* ============================
            REAL-TIME FEATURES
            ============================ */}

        <section className="section">
          <ActivityFeed
            accessToken={accessToken}
          />
        </section>

        <section className="section">
          <NotificationBell
            accessToken={accessToken}
          />
        </section>

        <section className="section">
          <OnlineUsers
            accessToken={accessToken}
            onCountChange={
              handleOnlineUsersChange
            }
          />
        </section>

        {/* ============================
            ADMIN DASHBOARD
            ============================ */}

        {user.role === "ADMIN" && (
          <>
            <AdminDashboard
              accessToken={accessToken}
              onlineUsers={onlineUsers}
            />

            <section className="section">
              <TaskList
                accessToken={accessToken}
                role={user.role}
                refreshKey={
                  taskRefreshKey
                }
              />
            </section>

            <section className="section">
              <CreateProject
                accessToken={accessToken}
                onProjectCreated={() => {
                  console.log(
                    "Project created"
                  );
                }}
              />
            </section>

            <section className="section">
              <CreateTask
                accessToken={accessToken}
                onTaskCreated={
                  handleTaskCreated
                }
              />
            </section>
          </>
        )}

        {/* ============================
            PROJECT MANAGER DASHBOARD
            ============================ */}

        {user.role ===
          "PROJECT_MANAGER" && (
          <>
            <ProjectManagerDashboard
              accessToken={accessToken}
            />

            <section className="section">
              <TaskList
                accessToken={accessToken}
                role={user.role}
                refreshKey={
                  taskRefreshKey
                }
              />
            </section>

            <section className="section">
              <CreateProject
                accessToken={accessToken}
                onProjectCreated={() => {
                  console.log(
                    "Project created"
                  );
                }}
              />
            </section>

            <section className="section">
              <CreateTask
                accessToken={accessToken}
                onTaskCreated={
                  handleTaskCreated
                }
              />
            </section>
          </>
        )}

        {/* ============================
            DEVELOPER DASHBOARD
            ============================ */}

        {user.role === "DEVELOPER" && (
          <>
            <DeveloperDashboard
              accessToken={accessToken}
            />

            <section className="section">
              <TaskList
                accessToken={accessToken}
                role={user.role}
                refreshKey={
                  taskRefreshKey
                }
              />
            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default App;