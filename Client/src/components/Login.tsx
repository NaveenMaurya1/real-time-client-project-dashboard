import { useState } from "react";

import { login } from "../services/auth";

interface LoginProps {
  onLogin: (
    accessToken: string,
    user: {
      id: number;
      name: string;
      email: string;
      role:
        | "ADMIN"
        | "PROJECT_MANAGER"
        | "DEVELOPER";
    }
  ) => void;
}

export default function Login({
  onLogin,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const result = await login(
        email,
        password
      );

      onLogin(
        result.accessToken,
        result.user
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Login Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "40px",
          boxSizing: "border-box",
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Logo / Icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "28px",
              fontWeight: "700",
              boxShadow:
                "0 8px 20px rgba(37, 99, 235, 0.3)",
            }}
          >
            CP
          </div>
        </div>

        {/* Heading */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "26px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Client Project Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Sign in to manage your projects
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "12px 14px",
                boxSizing: "border-box",
                border:
                  "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                color: "#111827",
                backgroundColor: "#f9fafb",
              }}
            />
          </div>

          {/* Password */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px 14px",
                boxSizing: "border-box",
                border:
                  "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                color: "#111827",
                backgroundColor: "#f9fafb",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border:
                  "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 16px",
              border: "none",
              borderRadius: "8px",
              background:
                loading
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              boxShadow: loading
                ? "none"
                : "0 6px 16px rgba(37, 99, 235, 0.25)",
              transition:
                "all 0.2s ease",
            }}
          >
            {loading
              ? "Logging in..."
              : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "28px",
            paddingTop: "20px",
            borderTop:
              "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            Secure access to your client
            project dashboard
          </p>
        </div>
      </div>
    </div>
  );
}