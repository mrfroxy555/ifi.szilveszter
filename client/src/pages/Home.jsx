import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-4">
                    Szilveszteri Játék
                </h1>
                <p className="text-xl text-slate-300">
                    Ifi Közösség 2025
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="card flex flex-col items-center text-center space-y-4 border border-indigo-500/30"
                >
                    <div className="text-6xl mb-2">🎮</div>
                    <h2 className="text-2xl font-bold">Játékos vagyok</h2>
                    <p className="text-slate-400">Csatlakozz egy meglévő játékhoz a telefonoddal.</p>
                    <Link to="/join" className="btn-primary w-full">
                        Csatlakozás
                    </Link>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="card flex flex-col items-center text-center space-y-4 border border-purple-500/30"
                >
                    <div className="text-6xl mb-2">👑</div>
                    <h2 className="text-2xl font-bold">Játékmester vagyok</h2>
                    <p className="text-slate-400">Indíts új játékot és vezesd le a kvízt.</p>
                    <Link to="/host" className="btn-secondary w-full bg-purple-600 hover:bg-purple-700">
                        Játék indítása
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
