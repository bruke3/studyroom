import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [activity, setActivity] = useState([]);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);

  // Get tasks
  useEffect(() => {
    fetch("http://localhost:5000/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // WebSocket
  useEffect(() => {
    if (!joined) return;

    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("WebSocket connected");

      socket.send(
        JSON.stringify({
          type: "join",
          name: name,
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "users") {
        setUsers(data.users);
      }

      if (data.type === "user_joined") {
        setUsers((current) =>
          current.includes(data.name)
            ? current
            : [...current, data.name]
        );

        setActivity((current) => [
          ...current,
          `${data.name} joined the room`,
        ]);
      }

      if (data.type === "user_left") {
        setUsers((current) =>
          current.filter((user) => user !== data.name)
        );

        setActivity((current) => [
          ...current,
          `${data.name} left the room`,
        ]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [joined, name]);

  // Add task
  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    const response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    const newTask = await response.json();

    setTasks([newTask, ...tasks]);
    setTitle("");
  }

  // Complete task
  async function toggleTask(id) {
    const response = await fetch(
      `http://localhost:5000/api/tasks/${id}`,
      {
        method: "PATCH",
      }
    );

    const updatedTask = await response.json();

    setTasks(
      tasks.map((task) =>
        task.id === id ? updatedTask : task
      )
    );
  }

  // Delete task
  async function deleteTask(id) {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
    });

    setTasks(tasks.filter((task) => task.id !== id));
  }

  return (
    <div className="app">
      <header className="header">
        <h1>StudyRoom</h1>
        <p>Plan your study. Stay focused.</p>
      </header>

      {/* Tasks */}
      <form className="task-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="What do you need to study?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button type="submit">Add Task</button>
      </form>

      <h2 className="section-title">My Tasks</h2>

      <div>
        {tasks.map((task) => (
          <div
            className={`task ${task.completed ? "completed" : ""}`}
            key={task.id}
          >
            <span
              className="task-title"
              onClick={() => toggleTask(task.id)}
            >
              {task.title}
            </span>

            <button
              className="delete-button"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Study Room */}
      <section className="room">
        <h2>Study Room</h2>

        {!joined ? (
          <>
            <p>Enter your name to join the room.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!name.trim()) return;

                setJoined(true);
              }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <button type="submit">Join Room</button>
            </form>
          </>
        ) : (
          <>
            <p>
              🟢 You are in the study room as{" "}
              <strong>{name}</strong>
            </p>

            <p>People in room</p>

            {users.map((user) => (
              <p key={user}>🟢 {user}</p>
            ))}

            <button
  onClick={() => {
    setJoined(false);
    setUsers([]);
    setActivity([]);
  }}
>
  Leave Room
</button>

            <p>Live activity</p>

            {activity.length === 0 ? (
              <p>No activity yet.</p>
            ) : (
              activity.map((message, index) => (
                <p key={index}>🟢 {message}</p>
              ))
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default App;