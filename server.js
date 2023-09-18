const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors")
app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("edit_code", (data) => {
    // Emit the edited code to all users in the room
    io.to(data.room).emit("receive_code", data.code);
  });

  socket.on("disconnectMe", (data) => {
    socket.leave(data);
  });

  socket.on("get_clients_in_room", (room) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(room);
    if (clientsInRoom) {
      const clientsArray = Array.from(clientsInRoom);
      console.log(`Clients in room ${room}:`, clientsArray);
      // Broadcast the updated list of clients to the room
      io.to(room).emit("clients_in_room", clientsArray);
    } else {
      console.log(`Room ${room} does not exist or has no clients.`);
    }
  });
});

app.use(cors());

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
