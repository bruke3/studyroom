const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");

const pool = require("./db");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/tasks", taskRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "StudyRoom API is running 🚀",
      database: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

// Store connected users
const clients = new Map();

function broadcast(data) {
  for (const client of clients.keys()) {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  }
}

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      clients.set(socket, data.name);

      // Send current users to the new user
      socket.send(
        JSON.stringify({
          type: "users",
          users: Array.from(clients.values()),
        })
      );

      // Tell everyone someone joined
      broadcast({
        type: "user_joined",
        name: data.name,
      });
    }
  });

  socket.on("close", () => {
    const name = clients.get(socket);

    clients.delete(socket);

    if (name) {
      broadcast({
        type: "user_left",
        name: name,
      });
    }

    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});