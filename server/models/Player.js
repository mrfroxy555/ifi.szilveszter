const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    socketId: {
        type: String,
        required: true,
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        answer: mongoose.Schema.Types.Mixed, // Number for scale, String for text
        answeredAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Player', PlayerSchema);
