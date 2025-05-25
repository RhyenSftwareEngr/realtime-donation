// backend/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev; restrict in prod
    methods: ["GET", "POST"],
  },
});

let cash = 100;

io.on("connection", (socket) => {
  // Send current cash to new client
  socket.emit("cashUpdate", cash);

  socket.on("donate", () => {
    cash += 10;
    io.emit("cashUpdate", cash);
  });

  socket.on("redeem", () => {
    cash -= 10;
    io.emit("cashUpdate", cash);
  });
});

server.listen(8888, () => {
  console.log("Server running on http://localhost:8888");
});
