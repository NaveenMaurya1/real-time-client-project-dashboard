import { useEffect, useState } from "react";
import { createSocket } from "../services/socket";

interface Activity {
  id: number;
  taskId: number;
  projectId: number;
  userId: number;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
}

interface ActivityFeedProps {
  accessToken: string;
}

const API_URL = "http://localhost:5000";

export default function ActivityFeed({
  accessToken,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<
    Activity[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Load the last 20 authorized activities
   * from the database.
   *
   * This also provides offline catch-up.
   */

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/activity`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch activities"
        );
      }

      const result = await response.json();

      /*
       * Depending on your controller response,
       * activities may be inside data.activities.
       */

      setActivities(
        result.data.activities || []
      );
    } catch (error) {
      console.error(
        "Failed to load activities:",
        error
      );

      setError(
        "Failed to load activity feed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    /*
     * Initial database load.
     */

    loadActivities();

    /*
     * Create Socket.IO connection.
     */

    const socket =
      createSocket(accessToken);

    /*
     * When socket connects, reload the
     * latest authorized activities.
     *
     * This handles offline catch-up.
     */

    socket.on("connect", () => {
      console.log(
        "Activity socket connected:",
        socket.id
      );

      loadActivities();
    });

    /*
     * Listen for real-time activity.
     */

    socket.on(
      "activity:new",
      (activity: Activity) => {
        console.log(
          "New activity received:",
          activity
        );

        setActivities((current) => {
          /*
           * Prevent duplicate activity entries.
           */

          const alreadyExists =
            current.some(
              (item) =>
                item.id === activity.id
            );

          if (alreadyExists) {
            return current;
          }

          /*
           * Add newest activity at the top.
           */

          return [
            activity,
            ...current,
          ].slice(0, 20);
        });
      }
    );

    /*
     * Socket error handling.
     */

    socket.on("connect_error", (error) => {
      console.error(
        "Activity socket error:",
        error
      );
    });

    /*
     * Cleanup when component unmounts.
     */

    return () => {
      socket.off("connect");

      socket.off(
        "activity:new"
      );

      socket.off(
        "connect_error"
      );

      socket.disconnect();
    };
  }, [accessToken]);

  if (loading) {
    return (
      <div>
        <h2>Live Activity</h2>
        <p>
          Loading activity...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Live Activity</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Live Activity</h2>

      {activities.length === 0 ? (
        <p>
          No activity yet.
        </p>
      ) : (
        <div>
          {activities.map(
            (activity) => (
              <div
                key={activity.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "6px",
                }}
              >
                <strong>
                  Task #{activity.taskId}
                </strong>

                <p>
                  {formatStatus(
                    activity.fromStatus
                  )}{" "}
                  →{" "}
                  {formatStatus(
                    activity.toStatus
                  )}
                </p>

                <small>
                  {new Date(
                    activity.createdAt
                  ).toLocaleString()}
                </small>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function formatStatus(
  status: string | null
) {
  if (!status) {
    return "Created";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}