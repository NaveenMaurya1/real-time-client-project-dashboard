import { useEffect, useState } from "react";

import {
    getTasks,
    updateTaskStatus,
} from "../services/tasks";

import type { Task } from "../services/tasks";

interface TaskListProps {
    accessToken: string;
    role: string;
    refreshKey?: number;
}

const STATUS_OPTIONS = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
];

const PRIORITY_OPTIONS = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];

const getInitialFilters = () => {
    const params = new URLSearchParams(
        window.location.search
    );

    return {
        status: params.get("status") || "",
        priority: params.get("priority") || "",
        from: params.get("from") || "",
        to: params.get("to") || "",
    };
};

const updateUrl = (
    newStatus: string,
    newPriority: string,
    newFrom: string,
    newTo: string
) => {
    const params = new URLSearchParams();

    if (newStatus) {
        params.set("status", newStatus);
    }

    if (newPriority) {
        params.set("priority", newPriority);
    }

    if (newFrom) {
        params.set("from", newFrom);
    }

    if (newTo) {
        params.set("to", newTo);
    }

    const query = params.toString();

    const newUrl = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname;

    window.history.replaceState(
        {},
        "",
        newUrl
    );
};

export default function TaskList({
    accessToken,
    role,
    refreshKey = 0,
}: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);

    const initialFilters = getInitialFilters();

    const [status, setStatus] = useState(
        initialFilters.status
    );

    const [priority, setPriority] = useState(
        initialFilters.priority
    );

    const [from, setFrom] = useState(
        initialFilters.from
    );

    const [to, setTo] = useState(
        initialFilters.to
    );

    const [loading, setLoading] = useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const loadTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getTasks(
                accessToken,
                {
                    status: status || undefined,
                    priority: priority || undefined,
                    from: from || undefined,
                    to: to || undefined,
                }
            );

            setTasks(data);
        } catch (error) {
            console.error(
                "Failed to load tasks:",
                error
            );

            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            loadTasks();
        }
    }, [
        accessToken,
        status,
        priority,
        from,
        to,
        refreshKey,
    ]);

    const handleStatusChange = async (
        taskId: number,
        newStatus: string
    ) => {
        try {
            await updateTaskStatus(
                accessToken,
                taskId,
                newStatus
            );

            await loadTasks();
        } catch (error) {
            console.error(
                "Failed to update status:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update task"
            );
        }
    };

    const clearFilters = () => {
        setStatus("");
        setPriority("");
        setFrom("");
        setTo("");

        window.history.replaceState(
            {},
            "",
            window.location.pathname
        );
    };

    return (
        <div>
            <h1>Tasks</h1>

            {/* Filters */}

            <div>
                <label>
                    Status{" "}
                    <select
                        value={status}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            setStatus(value);

                            updateUrl(
                                value,
                                priority,
                                from,
                                to
                            );
                        }}
                    >
                        <option value="">
                            All Statuses
                        </option>

                        {STATUS_OPTIONS.map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {formatValue(item)}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Priority{" "}
                    <select
                        value={priority}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            setPriority(value);

                            updateUrl(
                                status,
                                value,
                                from,
                                to
                            );
                        }}
                    >
                        <option value="">
                            All Priorities
                        </option>

                        {PRIORITY_OPTIONS.map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {formatValue(item)}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    From{" "}
                    <input
                        type="date"
                        value={from}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            setFrom(value);

                            updateUrl(
                                status,
                                priority,
                                value,
                                to
                            );
                        }}
                    />
                </label>

                <label>
                    To{" "}
                    <input
                        type="date"
                        value={to}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            setTo(value);

                            updateUrl(
                                status,
                                priority,
                                from,
                                value
                            );
                        }}
                    />
                </label>

                <button onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>

            <hr />

            {loading && (
                <p>Loading tasks...</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            {!loading &&
                !error &&
                tasks.length === 0 && (
                    <p>No tasks found.</p>
                )}

            {!loading &&
                !error &&
                tasks.length > 0 && (
                    <div>
                        {tasks.map((task) => (
                            <div key={task.id}>
                                <h3>
                                    #{task.id}{" "}
                                    {task.title}
                                </h3>

                                <p>
                                    Project:{" "}
                                    {task.project?.name ??
                                        "Unknown"}
                                </p>

                                <p>
                                    Priority:{" "}
                                    {formatValue(
                                        task.priority
                                    )}
                                </p>

                                <p>
                                    Status:{" "}
                                    {formatValue(
                                        task.status
                                    )}
                                </p>

                                <p>
                                    Due:{" "}
                                    {new Date(
                                        task.dueDate
                                    ).toLocaleDateString()}
                                </p>

                                {task.developer && (
                                    <p>
                                        Developer:{" "}
                                        {
                                            task
                                                .developer
                                                .name
                                        }
                                    </p>
                                )}

                                {role === "DEVELOPER" ? (
                                    <select
                                        value={task.status}
                                        onChange={(event) =>
                                            handleStatusChange(
                                                task.id,
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            task.status ===
                                            "DONE"
                                        }
                                    >
                                        {STATUS_OPTIONS.map(
                                            (item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {formatValue(
                                                        item
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                ) : (
                                    <p>
                                        Status changes are
                                        managed by authorized
                                        users.
                                    </p>
                                )}

                                <hr />
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

function formatValue(value: string) {
    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}