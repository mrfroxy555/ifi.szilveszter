import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostDashboard from './pages/Host/HostDashboard';
import GameScreen from './pages/Host/GameScreen';
import PlayerJoin from './pages/Player/PlayerJoin';
import PlayerGame from './pages/Player/PlayerGame';

function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Host Routes */}
                <Route path="/host" element={<HostDashboard />} />
                <Route path="/host/game/:gameId" element={<GameScreen />} />

                {/* Player Routes */}
                <Route path="/join" element={<PlayerJoin />} />
                <Route path="/play/:gameId" element={<PlayerGame />} />
            </Routes>
        </div>
    );
}

export default App;
