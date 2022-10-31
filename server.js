const express = require("express");
const app = express();
const PORT = process.env.PORT || 5566;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

var players = [];

io.on("connection", (socket) => {
  console.log("socketId", socket.id);

  socket.on("player-joined", (player) => {
    // console.log(player);
    player.id = socket.id;
    console.log(player);
    socket.emit("cur-player", player);
    // player.id = socket.id;
    players.push(player);
    console.log("Players", players);
    // socket.emit("player-id", socket.id);
    io.emit("total-players", players);
  });

  socket.on("player-move", (vel) => {
    //   let currPlayer = players.filter(p=>p.id == socket.id);
    io.emit("player-move", { id: socket.id, vel });
  });

  socket.on("player-shoot", (obj) => {
    let shooter = players.find((p) => p.id === socket.id);
    let bulletObj = {
      shooterId: socket.id,
      x: shooter.x,
      y: shooter.y,
      r: 4,
      color: shooter.color,
      vel: obj.vel,
    };
    console.log("BULLETOBJ", bulletObj);
    io.emit("player-shoot", bulletObj);
  });

  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);
    io.emit("total-players", players);

    console.log("client has disconnected", players.length);
  });
});

server.listen(PORT, console.log(`Listening in on port ${PORT}.`));
