import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const GameScreen = () => {
    const { gameId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();
    const [pin, setPin] = useState(location.state?.pin || '...');
    const [gameState, setGameState] = useState('waiting'); // waiting, active, finished
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [liveResults, setLiveResults] = useState(null);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        if (!socket) return;

        // Listeners
        socket.on('player_joined', (player) => {
            setPlayers(prev => [...prev, player]);
        });

        socket.on('game_started', () => {
            setGameState('active');
        });

        socket.on('new_question', (question) => {
            setCurrentQuestion(question);
            setLiveResults(null);
            setAnsweredCount(0);
        });

        socket.on('player_answered', () => {
            setAnsweredCount(prev => prev + 1);
        });

        socket.on('reaction_received', ({ type }) => {
            const id = Date.now() + Math.random();
            setReactions(prev => [...prev, { id, type, x: Math.random() * 80 + 10 }]); // Random X position 10-90%

            // Cleanup reaction after animation
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 2000);
        });

        socket.on('live_results', ({ answers }) => {
            // Process answers for chart
            if (currentQuestion?.type === 'scale' || currentQuestion?.type === 'select') {
                const counts = {};

                // Initialize counts for select options to ensure all appear even if 0
                if (currentQuestion.type === 'select') {
                    currentQuestion.options.forEach(opt => counts[opt] = 0);
                }

                answers.forEach(a => {
                    counts[a] = (counts[a] || 0) + 1;
                });

                const chartData = Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
                setLiveResults(chartData);
            } else {
                // Text answers - show list or word cloud (list for now)
                setLiveResults(answers);
            }
        });

        socket.on('game_over', (data) => {
            setGameState('finished');
            if (data) {
                setLiveResults(data); // Reuse liveResults for summary data
            }
        });

        return () => {
            socket.off('player_joined');
            socket.off('game_started');
            socket.off('new_question');
            socket.off('player_answered');
            socket.off('live_results');
            socket.off('game_over');
            socket.off('reaction_received');
        };
    }, [socket, currentQuestion]);

    const startGame = () => {
        socket.emit('start_game', { gameId });
    };

    const nextQuestion = () => {
        socket.emit('next_question', { gameId });
    };

    const showResults = () => {
        if (currentQuestion) {
            socket.emit('get_live_results', { gameId, questionId: currentQuestion._id });
        }
    };

    if (!socket) return <div>Connecting...</div>;

    return (
        <div className="min-h-screen p-6 flex flex-col items-center relative overflow-hidden">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl shadow-md z-10">
                <div className="text-2xl font-bold text-indigo-400">PIN: {pin}</div>
                <div className="text-xl">Játékosok: {players.length}</div>
                <div className="text-xl">Válaszolt: {answeredCount}</div>
            </div>

            {/* Lobby */}
            {gameState === 'waiting' && (
                <div className="w-full max-w-4xl text-center z-10">
                    <h2 className="text-4xl font-bold mb-8 animate-pulse">Várakozás a játékosokra...</h2>
                    <div className="flex flex-wrap gap-4 justify-center mb-12">
                        {players.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-slate-700 px-6 py-3 rounded-full text-lg font-semibold border border-indigo-500/50"
                            >
                                {p.name}
                            </motion.div>
                        ))}
                    </div>
                    <button onClick={startGame} className="btn-primary text-2xl px-12 py-4">
                        Játék Indítása 🚀
                    </button>
                </div>
            )}

            {/* Active Game */}
            {gameState === 'active' && currentQuestion && (
                <div className="w-full max-w-5xl flex flex-col items-center z-10">
                    <motion.div
                        key={currentQuestion._id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block bg-indigo-600 text-xs px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                            {currentQuestion.category}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            {currentQuestion.text}
                        </h2>
                    </motion.div>

                    {/* Results Visualization */}
                    <div className="w-full h-96 bg-slate-800/50 rounded-2xl p-6 mb-8 flex items-center justify-center border border-slate-700">
                        {!liveResults ? (
                            <div className="text-slate-500 text-xl italic">
                                Válaszok beérkezése folyamatban...
                            </div>
                        ) : (
                            (currentQuestion.type === 'scale' || currentQuestion.type === 'select') ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={liveResults} margin={{ bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#9ca3af"
                                            angle={currentQuestion.type === 'select' ? -45 : 0}
                                            textAnchor={currentQuestion.type === 'select' ? 'end' : 'middle'}
                                            height={60}
                                        />
                                        <YAxis stroke="#9ca3af" allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                            itemStyle={{ color: '#e5e7eb' }}
                                        />
                                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                            {liveResults.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                // Word Cloud / Text List
                                <div className="w-full h-full overflow-hidden relative">
                                    <div className="flex flex-wrap justify-center content-center gap-4 h-full overflow-y-auto">
                                        {liveResults.map((ans, i) => {
                                            // Calculate simple size based on length or random for visual interest
                                            const size = Math.min(1.5 + (ans.length > 20 ? 0 : Math.random()), 3);
                                            const color = ['#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'][i % 5];

                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1, type: 'spring' }}
                                                    style={{ fontSize: `${size}rem`, color }}
                                                    className="font-bold px-4 py-2 bg-slate-900/30 rounded-xl backdrop-blur-sm"
                                                >
                                                    {ans}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={showResults} className="btn-secondary">
                            Eredmények Mutatása 📊
                        </button>
                        <button onClick={nextQuestion} className="btn-primary">
                            Következő Kérdés ➡️
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over */}
            {gameState === 'finished' && (
                <div className="text-center w-full max-w-4xl z-10">
                    <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        Játék Vége! 🎉
                    </h2>
                    <p className="text-2xl text-slate-300 mb-8">Így értékeltétek az évet:</p>

                    {liveResults && (
                        <div className="w-full h-96 bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={liveResults}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" domain={[0, 10]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                        itemStyle={{ color: '#e5e7eb' }}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" name="Átlag pontszám" radius={[4, 4, 0, 0]}>
                                        <Cell fill="#6366f1" />
                                        <Cell fill="#a855f7" />
                                        <Cell fill="#ec4899" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <button onClick={() => navigate('/')} className="btn-secondary">
                        Vissza a főoldalra
                    </button>
                </div>
            )}

            {/* Floating Reactions */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                <AnimatePresence>
                    {reactions.map(r => (
                        <motion.div
                            key={r.id}
                            initial={{ y: '100vh', x: `${r.x}vw`, opacity: 1, scale: 0.5 }}
                            animate={{ y: '-10vh', opacity: 0, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute text-4xl"
                        >
                            {r.type}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GameScreen;
