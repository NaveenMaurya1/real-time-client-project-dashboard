import { useEffect } from "react";
import { createSocket } from "../services/socket";

interface OnlineUsersProps {
  accessToken: string;
  onCountChange: (count: number) => void;
}

export default function OnlineUsers({
  accessToken,
  onCountChange,
}: OnlineUsersProps) {
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = createSocket(accessToken);

    socket.on("connect", () => {
      // Presence socket connected
    });

    socket.on(
      "presence:count",
      (count: number) => {
        onCountChange(count);
      }
    );

    socket.on("disconnect", () => {
      // Presence socket disconnected
    });

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Presence socket error:",
          error.message
        );
      }
    );

    return () => {
      socket.off("connect");
      socket.off("presence:count");
      socket.off("disconnect");
      socket.off("connect_error");

      socket.disconnect();
    };
  }, [accessToken, onCountChange]);

  return null;
}