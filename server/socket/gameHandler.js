const Game = require('../models/Game');
const Player = require('../models/Player');
const Question = require('../models/Question');

module.exports = (io, socket) => {

    // Host creates a game
    socket.on('create_game', async () => {
        try {
            // Generate a random 6-digit PIN
            const pin = Math.floor(100000 + Math.random() * 900000).toString();

            // Fetch all questions to add to the game
            // In a real app, you might select a specific quiz
            const questions = await Question.find();

            const game = new Game({
                pin,
                hostSocketId: socket.id,
                status: 'waiting',
                questions: questions.map(q => q._id)
            });

            await game.save();

            socket.join(pin); // Host joins the room
            socket.emit('game_created', { pin, gameId: game._id });
            console.log(`Game created with PIN: ${pin}`);
        } catch (err) {
            console.error(err);
            socket.emit('error', 'Failed to create game');
        }
    });

    // Player joins a game
    socket.on('join_game', async ({ pin, name }) => {
        try {
            const game = await Game.findOne({ pin, status: 'waiting' });
            if (!game) {
                return socket.emit('error', 'Game not found or already started');
            }

            const player = new Player({
                name,
                socketId: socket.id,
                gameId: game._id
            });
            await player.save();

            game.players.push(player._id);
            await game.save();

            socket.join(pin); // Player joins the room

            // Notify host (and everyone in lobby)
            io.to(pin).emit('player_joined', { name, id: player._id });
            socket.emit('joined_success', { playerId: player._id, gameId: game._id });
            console.log(`Player ${name} joined game ${pin}`);
        } catch (err) {
            console.error(err);
            socket.emit('error', 'Failed to join game');
        }
    });

    // Host starts the game
    socket.on('start_game', async ({ gameId }) => {
        try {
            const game = await Game.findById(gameId);
            if (!game) return;

            game.status = 'active';
            game.currentQuestionIndex = 0;
            await game.save();

            const questions = await Question.find({ _id: { $in: game.questions } });
            const firstQuestion = questions[0];

            io.to(game.pin).emit('game_started');
            io.to(game.pin).emit('new_question', firstQuestion);
        } catch (err) {
            console.error(err);
        }
    });

    // Player submits answer
    socket.on('submit_answer', async ({ gameId, playerId, questionId, answer }) => {
        try {
            const player = await Player.findById(playerId);
            if (!player) return;

            // Check if already answered this question
            const existingAnswer = player.answers.find(a => a.questionId.toString() === questionId);
            if (existingAnswer) return; // Or update it

            player.answers.push({ questionId, answer });
            await player.save();

            const game = await Game.findById(gameId);

            // Notify host that a player answered (for live counter)
            io.to(game.hostSocketId).emit('player_answered', { playerId });

        } catch (err) {
            console.error(err);
        }
    });

    // Host moves to next question
    socket.on('next_question', async ({ gameId }) => {
        try {
            const game = await Game.findById(gameId);
            if (!game) return;

            const nextIndex = game.currentQuestionIndex + 1;

            if (nextIndex >= game.questions.length) {
                game.status = 'finished';
                await game.save();

                // Calculate Summary Stats
                const fullGame = await Game.findById(gameId).populate('players').populate('questions');
                const stats = {
                    faith: { sum: 0, count: 0 },
                    community: { sum: 0, count: 0 },
                    events: { sum: 0, count: 0 }
                };

                fullGame.players.forEach(player => {
                    player.answers.forEach(ans => {
                        const question = fullGame.questions.find(q => q._id.equals(ans.questionId));
                        if (question && question.type === 'scale' && typeof ans.answer === 'number') {
                            if (stats[question.category]) {
                                stats[question.category].sum += ans.answer;
                                stats[question.category].count++;
                            }
                        }
                    });
                });

                const summaryData = [
                    { name: 'Hit / Lelki élet', value: stats.faith.count ? Math.round(stats.faith.sum / stats.faith.count * 10) / 10 : 0 },
                    { name: 'Közösség', value: stats.community.count ? Math.round(stats.community.sum / stats.community.count * 10) / 10 : 0 },
                    { name: 'Élmények / Év', value: stats.events.count ? Math.round(stats.events.sum / stats.events.count * 10) / 10 : 0 }
                ];

                io.to(game.pin).emit('game_over', summaryData);
            } else {
                game.currentQuestionIndex = nextIndex;
                await game.save();

                const questions = await Question.find({ _id: { $in: game.questions } });
                const nextQuestion = questions[nextIndex];

                io.to(game.pin).emit('new_question', nextQuestion);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Get live results for current question
    socket.on('get_live_results', async ({ gameId, questionId }) => {
        try {
            const game = await Game.findById(gameId).populate('players');
            if (!game) return;

            // Aggregate answers
            const answers = [];
            game.players.forEach(p => {
                const ans = p.answers.find(a => a.questionId.toString() === questionId);
                if (ans) {
                    answers.push(ans.answer);
                }
            });

            socket.emit('live_results', { questionId, answers });

        } catch (err) {
            console.error(err);
        }
    });

    // Handle reactions
    socket.on('send_reaction', ({ gameId, type }) => {
        // Find game to get host socket
        Game.findById(gameId).then(game => {
            if (game && game.hostSocketId) {
                io.to(game.hostSocketId).emit('reaction_received', { type });
            }
        });
    });
};
