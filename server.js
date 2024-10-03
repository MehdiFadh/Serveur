var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use("/",express.static(__dirname + '/public'));

http.listen(3000, function () {
    console.log(`Server is listening on $:${http.address().port}`);
    
  });

  var io = require('socket.io')(http);

var players = {};
io.on('connection',function(socket){
  console.log('a user connected: ', socket.id);
  
  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    c: 0xFFFFFF*Math.random()|0
    
  };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    io.emit('disconnection', socket.id);
    });

    socket.on('playerMovement', function (movementData) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      // envoi un message aux autres joueur que le joueur s’est déplacé
      socket.broadcast.emit('playerMoved', players[socket.id]);
      });
    
    
  
});

