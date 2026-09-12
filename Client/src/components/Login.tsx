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
    <div>
      <h1>Client Project Dashboard</h1>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}