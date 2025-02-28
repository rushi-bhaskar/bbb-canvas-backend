const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const { log } = require("console");
const Assignment = require("./models/assignmentModels");
require("./mongoose");

// Create an Express application
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Use the file upload routes
app.use("/upload", uploadRoutes);
app.use("/assignment", assignmentRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], // Update this to match your frontend URL
    methods: ["GET", "POST"],
  },
});

// Store shapes (optional; for tracking state server-side)
let shapes = [{ x: 0, y: 0, width: 200, height: 200, color: "red" }];

let objects = {
  box1: { rotation: { x: 0, y: 0 } },
};

let shapesData = [
  { id: 1, type: "circle", color: "#ffffff" },
  { id: 2, type: "rectangle", color: "#ffffff" },
  { id: 3, type: "triangle", color: "#ffffff" },
];

let games = [];

// Track the current active assignment and positions
let currentAssignment = null;
let imagePositions = {};
let currentGame = {
  imageUrl: "http://localhost:5000/uploads/1740412731686-440069884.jpg", // URL of the image
  position: { x: 50, y: 50 }, // Initial position
  isVibrating: false, // Vibration state
};

const GAME_ROOM = "game_room";

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  //     // Authenticate client (optional)
  //     const token = socket.handshake.query.token;
  //     console.log(`Authentication token: ${token}`);

  //     // Send current shapes to the newly connected client
  //     socket.emit('initialize_shapes', shapes);

  //     // Send initial state to the client
  //     socket.emit("init", objects);

  //     // Listen for shape updates from a client
  //     socket.on('set_shape_', (data) => {
  //         console.log('Received shape update:', data);

  //         // Update shapes server-side (optional, if needed)
  //         const { current_index_, clientX, clientY } = data.data;
  //         if (shapes[current_index_]) {
  //             const dx = clientX - shapes[current_index_].x;
  //             const dy = clientY - shapes[current_index_].y;

  //             shapes[current_index_].x += dx;
  //             shapes[current_index_].y += dy;
  //         }

  //         // Broadcast the update to all other clients
  //         socket.broadcast.emit('set_shape_', data);
  //     });

  //         // Handle rotation events
  //   socket.on("rotateObject", ({ id, rotation }) => {
  //     if (objects[id]) {
  //       objects[id].rotation = rotation;
  //       io.emit("objectRotated", { id, rotation }); // Broadcast to all clients
  //     }
  //   });

  //   // Send initial shapes data
  //   socket.emit("init_shapes", shapesData);

  //   // Listen for shape color updates
  //   socket.on("update_color", (updatedShapes) => {
  //     shapesData = updatedShapes; // Update the server-side state
  //     io.emit("update_shapes", shapesData); // Broadcast updated shapes to all clients
  //   });

  //    // Send the current games to the newly connected client
  //    socket.emit('init_games', games);

  //   // Handle new game creation
  //   socket.on('new_game', (newGame) => {
  //     games.push(newGame);
  //     io.emit('update_games', games); // Broadcast the updated games array to all clients
  // });

  //   // Handle audio play event
  //   socket.on('play_audio', (soundUrl) => {
  //     io.emit('play_audio', soundUrl); // Broadcast the audio play event to all clients
  //   });

  // Send initial state (current assignment and positions) to new clients
  // socket.emit("init_state", {
  //   assignment: currentAssignment,
  //   positions: imagePositions,
  // });

  // Handle "start presentation" event
  // socket.on("start_presentation", (assignment) => {
  //   console.log(`Presentation started: ${assignment.name}`);
  //   console.log(`Presentation : ${assignment}`);
  //   currentAssignment = assignment;
  //   imagePositions = {}; // Reset positions
  //   io.emit("assignment_loaded", assignment); // Broadcast to all clients
  // });

  // Handle position updates from clients
  // socket.on("update_position", ({ imageId, newPos }) => {
  //   imagePositions[imageId] = newPos;
  //   // Broadcast to all clients except the sender
  //   socket.broadcast.emit("position_updated", { imageId, newPos });
  // });

  // // Handle incorrect placement (vibration)
  // socket.on("vibrate_image", (imageId) => {
  //   // Broadcast vibration to all clients
  //   io.emit("trigger_vibration", imageId);
  // });

  //Send initial game state to the new client
  // socket.emit("game_state_update", currentGame);

  // // Handle position updates from clients
  // socket.on("update_position", (newPosition) => {
  //   currentGame.position = newPosition;
  //   currentGame.isVibrating = false; // Reset vibration
  //   // Broadcast to all clients except the sender
  //   socket.broadcast.emit("game_state_update", currentGame);
  // });

  // Handle vibration trigger
  // socket.on("trigger_vibration", () => {
  //   currentGame.isVibrating = true;
  //   // Broadcast to all clients
  //   io.emit("game_state_update", currentGame);
  // });

  console.log(`Client connected: ${socket.id}`);
  socket.join(GAME_ROOM);

    // Send current assignment to new clients
    if (currentAssignment) {
      console.log(`📡 Sending stored assignment to new client: ${socket.id}`);
      socket.emit("load_assignment", currentAssignment);
  }
  

  socket.on("start_presentation", async (assignmentId) => {
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) return;

            // Store assignment so new clients can receive it
            currentAssignment = {
              name: assignment.name,
              objects: assignment.objects,
          };

      io.to(GAME_ROOM).emit("load_assignment", {
        name: assignment.name,
        objects: assignment.objects,
      });
    } catch (err) {
      console.error("Error loading assignment:", err);
    }
  });

  socket.on("update_position", ({ imageSrc, position }) => {
    io.to(GAME_ROOM).emit("position_updated", { imageSrc, position });
  });

  socket.on("vibrate_image", ({ imageSrc }) => {
    console.log("📡 Server received vibrate_image event for:", imageSrc);
    io.to(GAME_ROOM).emit("vibrate_image", { imageSrc });
});

socket.on("image_correctly_placed", ({ imageSrc }) => {
  console.log("📡 Server broadcasting correct placement for:", imageSrc);
  io.to(GAME_ROOM).emit("image_correctly_placed", { imageSrc });
});


  // // Listen for image move events
  // socket.on("move_image", (newPosition) => {
  //   // Broadcast the new position to all clients
  //   io.emit("update_position", newPosition);
  // });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// API Route for testing
app.get("/", (req, res) => {
  res.send("Socket.IO backend is running!");
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
