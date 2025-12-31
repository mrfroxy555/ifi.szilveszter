import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to the server
        // In production, this should be the actual server URL
        const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
