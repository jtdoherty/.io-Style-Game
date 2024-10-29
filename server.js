const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const players = {};
const foods = [];

// Generate initial food
for (let i = 0; i < 50; i++) {
    foods.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        id: `food-${i}`
    });
}

io.on('connection', (socket) => {
    // New player connects
    players[socket.id] = {
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: 20,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        id: socket.id
    };

    // Send current game state to new player
    socket.emit('init', {
        selfId: socket.id,
        players,
        foods
    });

    // Broadcast new player to all other players
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle player movement
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(3000, () => {
    console.log('Server running on port 3000');
});