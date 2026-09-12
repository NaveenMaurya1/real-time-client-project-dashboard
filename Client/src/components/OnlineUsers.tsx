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
      console.log(
        "Presence socket connected"
      );
    });

    socket.on(
      "presence:count",
      (count: number) => {
        console.log(
          "Online users:",
          count
        );

        onCountChange(count);
      }
    );

    socket.on("disconnect", () => {
      console.log(
        "Presence socket disconnected"
      );
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
      socket.disconnect();
    };
  }, [accessToken, onCountChange]);

  return null;
}