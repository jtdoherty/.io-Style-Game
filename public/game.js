const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const socket = io();
let players = {};
let foods = [];
let selfId = null;
let camera = { x: 0, y: 0 };

socket.on('init', (data) => {
    selfId = data.selfId;
    players = data.players;
    foods = data.foods;
});

socket.on('newPlayer', (player) => {
    players[player.id] = player;
});

socket.on('playerMoved', (data) => {
    if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
    }
});

socket.on('playerDisconnected', (playerId) => {
    delete players[playerId];
});

// Handle player input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function movePlayer() {
    if (!players[selfId]) return;

    const speed = 5;
    const player = players[selfId];
    let moved = false;

    if (keys['ArrowUp'] || keys['w']) {
        player.y -= speed;
        moved = true;
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y += speed;
        moved = true;
    }
    if (keys['ArrowLeft'] || keys['a']) {
        player.x -= speed;
        moved = true;
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x += speed;
        moved = true;
    }

    if (moved) {
        socket.emit('move', { x: player.x, y: player.y });
    }

    // Update camera position
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw foods
    foods.forEach(food => {
        ctx.beginPath();
        ctx.arc(food.x - camera.x, food.y - camera.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.closePath();
    });

    // Draw players
    Object.values(players).forEach(player => {
        ctx.beginPath();
        ctx.arc(player.x - camera.x, player.y - camera.y, player.size, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();
    });
}

function gameLoop() {
    movePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();