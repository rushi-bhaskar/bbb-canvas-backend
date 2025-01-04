const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Create an Express application
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Update this to match your frontend URL
        methods: ["GET", "POST"],
    },
});

// Store shapes (optional; for tracking state server-side)
let shapes = [
    { x: 0, y: 0, width: 200, height: 200, color: 'red' },
];

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Authenticate client (optional)
    const token = socket.handshake.query.token;
    console.log(`Authentication token: ${token}`);

    // Send current shapes to the newly connected client
    socket.emit('initialize_shapes', shapes);

    // Listen for shape updates from a client
    socket.on('set_shape_', (data) => {
        console.log('Received shape update:', data);

        // Update shapes server-side (optional, if needed)
        const { current_index_, clientX, clientY } = data.data;
        if (shapes[current_index_]) {
            const dx = clientX - shapes[current_index_].x;
            const dy = clientY - shapes[current_index_].y;

            shapes[current_index_].x += dx;
            shapes[current_index_].y += dy;
        }

        // Broadcast the update to all other clients
        socket.broadcast.emit('set_shape_', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// API Route for testing
app.get('/', (req, res) => {
    res.send('Socket.IO backend is running!');
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
