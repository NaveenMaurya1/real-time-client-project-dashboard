import { useCallback, useEffect, useState } from "react";

import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProjectManagerDashboard from "./components/ProjectManagerDashboard";
import DeveloperDashboard from "./components/DeveloperDashboard";

import TaskList from "./components/TaskList";
import CreateTask from "./components/CreateTask";
import CreateProject from "./components/CreateProject";

import ActivityFeed from "./components/ActivityFeed";
import NotificationBell from "./components/NotificationBell";
import OnlineUsers from "./components/OnlineUsers";

import {
  getCurrentUser,
  logout,
  refreshAccessToken,
  type User,
} from "./services/auth";

export default function App() {
  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [onlineUsers, setOnlineUsers] =
    useState(0);

  const [taskRefreshKey, setTaskRefreshKey] =
    useState(0);

  /**
   * Restore the user's session when the application starts.
   *
   * Access token is kept in React state.
   * Refresh token is stored securely in an HttpOnly cookie.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token =
          await refreshAccessToken();

        const currentUser =
          await getCurrentUser(token);

        setAccessToken(token);
        setUser(currentUser);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Handle successful login.
   */
  const handleLogin = useCallback(
    (
      token: string,
      loggedInUser: User
    ) => {
      setAccessToken(token);
      setUser(loggedInUser);
    },
    []
  );

  /**
   * Logout the current user.
   */
  const handleLogout = useCallback(
    async () => {
      try {
        await logout();
      } finally {
        setAccessToken(null);
        setUser(null);
        setOnlineUsers(0);
      }
    },
    []
  );

  /**
   * Update online-user count.
   */
  const handleOnlineUsersChange =
    useCallback((count: number) => {
      setOnlineUsers(
        Number.isFinite(count) && count >= 0
          ? count
          : 0
      );
    }, []);

  /**
   * Refresh task-related components after
   * creating or updating a task/project.
   */
  const handleTaskChange = useCallback(() => {
    setTaskRefreshKey(
      (current) => current + 1
    );
  }, []);

  /**
   * Login screen.
   */
  if (!loading && !accessToken) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  /**
   * Initial session restoration screen.
   */
  if (
    loading ||
    !user ||
    !accessToken
  ) {
    return (
      <>
        <style>
          {`
            @keyframes appLoadingSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            .app-loading {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              background:
                radial-gradient(
                  circle at top left,
                  rgba(99, 102, 241, 0.12),
                  transparent 35%
                ),
                #f8fafc;
            }

            .app-loading-card {
              width: min(420px, 100%);
              padding: 40px 32px;
              text-align: center;
              background: rgba(255, 255, 255, 0.96);
              border: 1px solid #e5e7eb;
              border-radius: 18px;
              box-shadow:
                0 20px 45px rgba(15, 23, 42, 0.08);
            }

            .app-loading-icon {
              width: 52px;
              height: 52px;
              margin: 0 auto 20px;
              border: 4px solid #e0e7ff;
              border-top-color: #4f46e5;
              border-radius: 50%;
              animation:
                appLoadingSpin 0.8s linear infinite;
            }

            .app-loading-title {
              margin: 0;
              color: #111827;
              font-size: 20px;
              font-weight: 800;
            }

            .app-loading-text {
              margin: 8px 0 0;
              color: #64748b;
              font-size: 14px;
            }
          `}
        </style>

        <div className="app-loading">
          <div className="app-loading-card">
            <div className="app-loading-icon" />

            <h1 className="app-loading-title">
              Loading Dashboard
            </h1>

            <p className="app-loading-text">
              Restoring your secure session...
            </p>
          </div>
        </div>
      </>
    );
  }

  const roleLabel =
    user.role === "ADMIN"
      ? "Administrator"
      : user.role === "PROJECT_MANAGER"
        ? "Project Manager"
        : "Developer";

  const avatarLetter =
    user.name?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #f8fafc;
            color: #111827;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          button,
          input,
          select,
          textarea {
            font: inherit;
          }

          .app-shell {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 0% 0%,
                rgba(99, 102, 241, 0.10),
                transparent 30%
              ),
              radial-gradient(
                circle at 100% 0%,
                rgba(129, 140, 248, 0.08),
                transparent 28%
              ),
              #f8fafc;
          }

          /* =========================
             HEADER
          ========================= */

          .app-header {
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom:
              1px solid rgba(226, 232, 240, 0.9);
            background:
              rgba(255, 255, 255, 0.94);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
          }

          .app-header-inner {
            width:
              min(1400px, calc(100% - 32px));
            min-height: 76px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .app-brand {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 13px;
          }

          .app-brand-icon {
            width: 44px;
            height: 44px;
            flex: 0 0 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 13px;
            color: white;
            background:
              linear-gradient(
                135deg,
                #4f46e5,
                #7c3aed
              );
            box-shadow:
              0 8px 18px
              rgba(79, 70, 229, 0.24);
          }

          .app-brand-text {
            min-width: 0;
          }

          .app-brand-title {
            margin: 0;
            color: #111827;
            font-size: 17px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .app-brand-subtitle {
            margin: 3px 0 0;
            color: #64748b;
            font-size: 12px;
            white-space: nowrap;
          }

          .app-header-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 14px;
          }

          /* =========================
             ONLINE USERS
          ========================= */

          .app-online-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px solid #dcfce7;
            border-radius: 999px;
            color: #166534;
            background: #f0fdf4;
            font-size: 12px;
            font-weight: 700;
          }

          .app-online-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow:
              0 0 0 4px
              rgba(34, 197, 94, 0.12);
          }

          /* =========================
             USER
          ========================= */

          .app-user {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .app-user-avatar {
            width: 40px;
            height: 40px;
            flex: 0 0 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #4338ca;
            background: #eef2ff;
            border: 1px solid #e0e7ff;
            font-size: 14px;
            font-weight: 800;
          }

          .app-user-info {
            min-width: 0;
          }

          .app-user-name {
            max-width: 170px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #111827;
            font-size: 13px;
            font-weight: 750;
          }

          .app-user-role {
            margin-top: 2px;
            color: #64748b;
            font-size: 11px;
          }

          /* =========================
             LOGOUT
          ========================= */

          .app-logout {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            min-height: 40px;
            padding: 0 13px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            color: #475569;
            background: white;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
            transition:
              background 0.2s ease,
              border-color 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease;
          }

          .app-logout:hover {
            color: #dc2626;
            background: #fef2f2;
            border-color: #fecaca;
            transform: translateY(-1px);
          }

          /* =========================
             MAIN
          ========================= */

          .app-main {
            width:
              min(1400px, calc(100% - 32px));
            margin: 0 auto;
            padding: 28px 0 50px;
          }

          /* =========================
             WELCOME
          ========================= */

          .app-welcome {
            margin-bottom: 24px;
            padding: 24px 26px;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            background:
              rgba(255, 255, 255, 0.9);
            box-shadow:
              0 8px 30px
              rgba(15, 23, 42, 0.04);
          }

          .app-welcome-eyebrow {
            margin-bottom: 6px;
            color: #6366f1;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .app-welcome-title {
            margin: 0;
            color: #111827;
            font-size:
              clamp(22px, 3vw, 30px);
            font-weight: 850;
            letter-spacing: -0.035em;
          }

          .app-welcome-description {
            max-width: 700px;
            margin: 7px 0 0;
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }

          /* =========================
             REAL-TIME SECTION
          ========================= */

          .app-realtime-grid {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }

          /* =========================
             GENERIC SECTION
          ========================= */

          .app-section {
            min-width: 0;
            margin-top: 24px;
          }

          .app-role-section {
            min-width: 0;
          }

          .app-section-card {
            min-width: 0;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            background: white;
            box-shadow:
              0 8px 30px
              rgba(15, 23, 42, 0.04);
          }

          .app-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
          }

          .app-section-title {
            margin: 0;
            color: #111827;
            font-size: 16px;
            font-weight: 800;
          }

          .app-section-description {
            margin: 4px 0 0;
            color: #64748b;
            font-size: 12px;
          }

          /* =========================
             FOOTER
          ========================= */

          .app-footer {
            margin-top: 34px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            color: #94a3b8;
            font-size: 11px;
          }

          .app-footer-status {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .app-footer-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #22c55e;
          }

          /* =========================
             RESPONSIVE
          ========================= */

          @media (max-width: 1000px) {
            .app-header-inner {
              min-height: 70px;
            }

            .app-user-info {
              display: none;
            }
          }

          @media (max-width: 700px) {
            .app-header-inner,
            .app-main {
              width:
                min(100% - 20px, 1400px);
            }

            .app-header-inner {
              gap: 10px;
            }

            .app-brand-subtitle {
              display: none;
            }

            .app-brand-title {
              font-size: 15px;
            }

            .app-brand-icon {
              width: 40px;
              height: 40px;
              flex-basis: 40px;
            }

            .app-online-badge {
              padding: 7px 9px;
            }

            .app-logout span {
              display: none;
            }

            .app-logout {
              width: 40px;
              padding: 0;
            }

            .app-main {
              padding-top: 16px;
            }

            .app-welcome {
              padding: 20px;
            }

            .app-footer {
              flex-direction: column;
              align-items: flex-start;
            }
          }

          @media (max-width: 480px) {
            .app-online-badge {
              display: none;
            }

            .app-header-actions {
              gap: 7px;
            }

            .app-welcome-title {
              font-size: 23px;
            }
          }
        `}
      </style>

      <div className="app-shell">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="app-header">
          <div className="app-header-inner">

            {/* Brand */}
            <div className="app-brand">

              <div className="app-brand-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                  />

                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                  />

                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                  />

                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                  />
                </svg>
              </div>

              <div className="app-brand-text">
                <h1 className="app-brand-title">
                  Client Project Dashboard
                </h1>

                <p className="app-brand-subtitle">
                  Real-time project management workspace
                </p>
              </div>
            </div>

            {/* =================================================
                HEADER ACTIONS

                NotificationBell belongs HERE.

                Order:
                Online Users
                → Notifications
                → User
                → Logout
            ================================================= */}

            <div className="app-header-actions">

              {/* Online users */}
              <div className="app-online-badge">
                <span className="app-online-dot" />

                <span>
                  {onlineUsers}{" "}
                  {onlineUsers === 1
                    ? "user"
                    : "users"}{" "}
                  online
                </span>
              </div>

              {/* Notification bell */}
              <NotificationBell
                accessToken={accessToken}
              />

              {/* User information */}
              <div className="app-user">

                <div className="app-user-avatar">
                  {avatarLetter}
                </div>

                <div className="app-user-info">

                  <div className="app-user-name">
                    {user.name}
                  </div>

                  <div className="app-user-role">
                    {roleLabel}
                  </div>

                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                className="app-logout"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                </svg>

                <span>
                  Logout
                </span>
              </button>

            </div>
          </div>
        </header>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="app-main">

          {/* Welcome */}
          <section className="app-welcome">

            <div className="app-welcome-eyebrow">
              {roleLabel} Workspace
            </div>

            <h2 className="app-welcome-title">
              Welcome back, {user.name}
            </h2>

            <p className="app-welcome-description">
              Monitor projects, manage tasks, and
              stay updated with real-time activity
              across your workspace.
            </p>

          </section>

          {/* =================================================
              PRESENCE SOCKET

              This component manages the Socket.IO
              presence connection and returns null.
          ================================================= */}

          <OnlineUsers
            accessToken={accessToken}
            onCountChange={
              handleOnlineUsersChange
            }
          />

          {/* =================================================
              REAL-TIME ACTIVITY

              NotificationBell is NOT placed here.
              It already exists in the header.
          ================================================= */}

          <section className="app-realtime-grid">

            <ActivityFeed
              accessToken={accessToken}
            />

          </section>

          {/* =================================================
              ADMIN
          ================================================= */}

          {user.role === "ADMIN" && (
            <div className="app-role-section">

              <AdminDashboard
                accessToken={accessToken}
                onlineUsers={onlineUsers}
              />

              <section className="app-section">
                <TaskList
                  accessToken={accessToken}
                  role={user.role}
                  refreshKey={taskRefreshKey}
                />
              </section>

              <section className="app-section">
                <CreateProject
                  accessToken={accessToken}
                  onProjectCreated={
                    handleTaskChange
                  }
                />
              </section>

              <section className="app-section">
                <CreateTask
                  accessToken={accessToken}
                  onTaskCreated={
                    handleTaskChange
                  }
                />
              </section>

            </div>
          )}

          {/* =================================================
              PROJECT MANAGER
          ================================================= */}

          {user.role === "PROJECT_MANAGER" && (
            <div className="app-role-section">

              <ProjectManagerDashboard
                accessToken={accessToken}
              />

              <section className="app-section">
                <TaskList
                  accessToken={accessToken}
                  role={user.role}
                  refreshKey={taskRefreshKey}
                />
              </section>

              <section className="app-section">
                <CreateProject
                  accessToken={accessToken}
                  onProjectCreated={
                    handleTaskChange
                  }
                />
              </section>

              <section className="app-section">
                <CreateTask
                  accessToken={accessToken}
                  onTaskCreated={
                    handleTaskChange
                  }
                />
              </section>

            </div>
          )}

          {/* =================================================
              DEVELOPER
          ================================================= */}

          {user.role === "DEVELOPER" && (
            <div className="app-role-section">

              <DeveloperDashboard
                accessToken={accessToken}
              />

              <section className="app-section">
                <TaskList
                  accessToken={accessToken}
                  role={user.role}
                  refreshKey={taskRefreshKey}
                />
              </section>

            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="app-footer">

            <div>
              Client Project Dashboard
            </div>

            <div className="app-footer-status">

              <span className="app-footer-dot" />

              Real-time services connected

            </div>

          </footer>

        </main>
      </div>
    </>
  );
}