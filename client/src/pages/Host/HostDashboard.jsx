import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';

const HostDashboard = () => {
    const socket = useSocket();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.on('game_created', ({ pin, gameId }) => {
            navigate(`/host/game/${gameId}`, { state: { pin } });
        });

        socket.on('error', (msg) => {
            setError(msg);
        });

        return () => {
            socket.off('game_created');
            socket.off('error');
        };
    }, [socket, navigate]);

    const createGame = () => {
        if (socket) {
            socket.emit('create_game');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card max-w-md w-full text-center space-y-6"
            >
                <h1 className="text-3xl font-bold text-white">Játékmester Pult</h1>
                <p className="text-slate-400">
                    Hozz létre egy új játékot. A PIN kódot a következő képernyőn fogod látni.
                </p>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={createGame}
                    className="btn-primary w-full text-lg"
                >
                    Új Játék Indítása
                </button>
            </motion.div>
        </div>
    );
};

export default HostDashboard;
