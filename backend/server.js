// Import required modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

// Initialize Express app
const app = express();
app.use(cors());

// Create HTTP server and bind Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch-all route to serve React app, but exclude /socket.io for Socket.IO to work
app.get(/^\/(?!socket.io).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Initialize cash variable to track total donations
let cash = 100;

// Listen for client connections
io.on("connection", (socket) => {
  // Send current cash value to newly connected client
  socket.emit("cashUpdate", cash);

  // Listen for 'donate' event from client
  socket.on("donate", () => {
    cash += 10; // Increase cash by 10
    io.emit("cashUpdate", cash); // Broadcast new cash value to all clients
  });

  // Listen for 'redeem' event from client
  socket.on("redeem", () => {
    if (cash > 0) {
      cash -= 10; // Decrease cash by 10
      io.emit("cashUpdate", cash); // Broadcast new cash value to all clients
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
