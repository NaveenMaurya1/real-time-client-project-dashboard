export interface User {
  id: number;
  name: string;
  email: string;
  role:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  } catch (error) {
    console.error("Login network error:", error);

    throw new Error(
      "Unable to connect to the server. Make sure the backend is running on port 5000."
    );
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Login failed"
    );
  }

  return result.data;
};

export const refreshAccessToken =
  async (): Promise<string> => {
    let response: Response;

    try {
      response = await fetch(
        `${API_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch {
      throw new Error(
        "Unable to connect to the server."
      );
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error?.message ||
          "Session expired"
      );
    }

    return result.data.accessToken;
  };

export const getCurrentUser = async (
  accessToken: string
): Promise<User> => {
  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Unable to fetch current user"
    );
  }

  return result.data.user;
};

export const logout = async (): Promise<void> => {
  await fetch(
    `${API_URL}/api/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );
};