import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerGame = () => {
    const { gameId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();

    const [playerId] = useState(location.state?.playerId);
    const [name] = useState(location.state?.name);
    const [gameState, setGameState] = useState('waiting'); // waiting, active, answered, finished
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!socket || !playerId) {
            navigate('/join');
            return;
        }

        socket.on('game_started', () => {
            setGameState('active');
        });

        socket.on('new_question', (question) => {
            setCurrentQuestion(question);
            setSubmitted(false);
            setAnswer('');
            setGameState('active');
        });

        socket.on('game_over', () => {
            setGameState('finished');
        });

        return () => {
            socket.off('game_started');
            socket.off('new_question');
            socket.off('game_over');
        };
    }, [socket, playerId, navigate]);

    const submitAnswer = () => {
        if (!answer && answer !== 0) return; // Allow 0 as answer

        socket.emit('submit_answer', {
            gameId,
            playerId,
            questionId: currentQuestion._id,
            answer
        });
        setSubmitted(true);
        setGameState('answered');
    };

    const sendReaction = (type) => {
        socket.emit('send_reaction', { gameId, type });
    };

    if (!playerId) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {/* Waiting Room */}
                {gameState === 'waiting' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="text-6xl animate-bounce">⏳</div>
                        <h2 className="text-2xl font-bold">Szia {name}!</h2>
                        <p className="text-slate-400">Várj, amíg a játékmester elindítja a játékot...</p>
                    </motion.div>
                )}

                {/* Active Question */}
                {gameState === 'active' && currentQuestion && (
                    <motion.div
                        key="question"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                            <span className="text-xs uppercase tracking-wider text-indigo-400 mb-2 block">
                                {currentQuestion.category}
                            </span>
                            <h2 className="text-xl font-bold">{currentQuestion.text}</h2>
                        </div>

                        <div className="space-y-6">
                            {currentQuestion.type === 'scale' ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>{currentQuestion.options[0]}</span>
                                        <span>{currentQuestion.options[1]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={answer || 5}
                                        onChange={(e) => setAnswer(Number(e.target.value))}
                                        className="w-full h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="text-center text-3xl font-bold text-indigo-400">
                                        {answer || 5}
                                    </div>
                                </div>
                            ) : currentQuestion.type === 'select' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {currentQuestion.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setAnswer(opt)}
                                            className={`p-4 rounded-lg font-semibold transition-all ${answer === opt
                                                ? 'bg-indigo-600 ring-2 ring-indigo-400'
                                                : 'bg-slate-700 hover:bg-slate-600'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="input-field h-32 resize-none"
                                    placeholder="Írd ide a válaszod..."
                                />
                            )}

                            <button
                                onClick={submitAnswer}
                                className="btn-primary w-full py-4 text-xl shadow-indigo-500/50"
                            >
                                Küldés 📨
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Answer Submitted */}
                {gameState === 'answered' && (
                    <motion.div
                        key="answered"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="text-6xl">✅</div>
                        <h2 className="text-2xl font-bold">Válasz elküldve!</h2>
                        <p className="text-slate-400">Figyeld a kivetítőt...</p>
                    </motion.div>
                )}

                {/* Game Over */}
                {gameState === 'finished' && (
                    <motion.div
                        key="finished"
                        className="text-center space-y-6"
                    >
                        <div className="text-6xl">👋</div>
                        <h2 className="text-3xl font-bold">Vége a játéknak!</h2>
                        <button onClick={() => navigate('/')} className="btn-secondary">
                            Kilépés
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reaction Bar */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 z-50">
                {['❤️', '😂', '👏', '🔥'].map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-full text-2xl shadow-lg border border-slate-600 active:scale-90 transition-transform"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlayerGame;
