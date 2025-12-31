require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hevesitamas7:tuglika2005@cluster0.riugxg4.mongodb.net/szilveszter?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this dev setup
        methods: ["GET", "POST"]
    }
});

const gameHandler = require('./socket/gameHandler');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    gameHandler(io, socket);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle player disconnect logic if needed
    });
});

// Routes
const questionRoutes = require('./routes/questions');
app.use('/api/questions', questionRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
