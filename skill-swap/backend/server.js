const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/db");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  },
});

app.use(cors());
app.use(express.json());

// Initialize PostgreSQL Database
db.initDb().then(() => {
  console.log("PostgreSQL database setup successfully initialized!");
}).catch(err => {
  console.error("WARNING: Failed to initialize PostgreSQL database:", err.message);
  console.log("Proceeding to start Express server in fallback mode (database requests will fail).");
});

// Basic check route
app.get("/", (req, res) => {
  res.send("Skill Swap PostgreSQL Backend Running 🚀");
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

// Socket.io Real-time Operations
require("./sockets/chatSocket")(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Skill Swap server running on port ${PORT}`);
});