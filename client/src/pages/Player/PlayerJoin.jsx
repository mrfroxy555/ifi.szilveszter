import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';

const PlayerJoin = () => {
    const socket = useSocket();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.on('joined_success', ({ playerId, gameId }) => {
            navigate(`/play/${gameId}`, { state: { playerId, name } });
        });

        socket.on('error', (msg) => {
            setError(msg);
        });

        return () => {
            socket.off('joined_success');
            socket.off('error');
        };
    }, [socket, navigate, name]);

    const joinGame = (e) => {
        e.preventDefault();
        if (!name || !pin) {
            setError('Minden mező kitöltése kötelező!');
            return;
        }
        if (socket) {
            socket.emit('join_game', { pin, name });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card max-w-sm w-full space-y-6"
            >
                <h1 className="text-3xl font-bold text-center">Csatlakozás</h1>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={joinGame} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Neved (vagy beceneved)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="pl. Gipsz Jakab"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Játék PIN kód</label>
                        <input
                            type="text" // changed from number to text to avoid scroll arrows and allow leading zeros if needed
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="input-field text-center text-2xl tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        Mehet! 🚀
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default PlayerJoin;
