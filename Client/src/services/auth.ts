
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

const API_URL = "http://localhost:5000";

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(
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
    const response = await fetch(
      `${API_URL}/api/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

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

