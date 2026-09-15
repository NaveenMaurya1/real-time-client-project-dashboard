import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const createSocket = (
  accessToken: string
) => {
  return io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },

    withCredentials: true,
  });
};