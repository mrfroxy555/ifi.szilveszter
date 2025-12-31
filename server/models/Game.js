const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    pin: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting',
    },
    hostSocketId: {
        type: String,
        required: true,
    },
    currentQuestionIndex: {
        type: Number,
        default: -1, // -1 means lobby
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Game', GameSchema);
