const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require("multer");
const path = require("path");

const upload = multer({ dest: "uploads/" });

// Create an Express application
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

app.post("/upload", upload.single("file"), (req, res) => {
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  });
  
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000","http://localhost:5173"], // Update this to match your frontend URL
        methods: ["GET", "POST"],
    },
}); 

// Store shapes (optional; for tracking state server-side)
let shapes = [
    { x: 0, y: 0, width: 200, height: 200, color: 'red' },
];

let objects = {
    box1: { rotation: { x: 0, y: 0 } },
  };

  let shapesData = [
    { id: 1, type: "circle", color: "#ffffff" },
    { id: 2, type: "rectangle", color: "#ffffff" },
    { id: 3, type: "triangle", color: "#ffffff" },
  ];

  let games = [];

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Authenticate client (optional)
    const token = socket.handshake.query.token;
    console.log(`Authentication token: ${token}`);

    // Send current shapes to the newly connected client
    socket.emit('initialize_shapes', shapes);
    
    // Send initial state to the client
    socket.emit("init", objects);

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

        // Handle rotation events
  socket.on("rotateObject", ({ id, rotation }) => {
    if (objects[id]) {
      objects[id].rotation = rotation;
      io.emit("objectRotated", { id, rotation }); // Broadcast to all clients
    }
  });

  // Send initial shapes data
  socket.emit("init_shapes", shapesData);

  // Listen for shape color updates
  socket.on("update_color", (updatedShapes) => {
    shapesData = updatedShapes; // Update the server-side state
    io.emit("update_shapes", shapesData); // Broadcast updated shapes to all clients
  });

   // Send the current games to the newly connected client
   socket.emit('init_games', games);

  // Handle new game creation
  socket.on('new_game', (newGame) => {
    games.push(newGame);
    io.emit('update_games', games); // Broadcast the updated games array to all clients
});

  // Handle audio play event
  socket.on('play_audio', (soundUrl) => {
    io.emit('play_audio', soundUrl); // Broadcast the audio play event to all clients
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
