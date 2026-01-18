import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WhiteboardElement, WhiteboardElementType } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000/whiteboard';

export const useWhiteboard = (roomId: string) => {
    const socketRef = useRef<Socket | null>(null);
    const [elements, setElements] = useState<WhiteboardElement[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = io(SOCKET_URL, {
            auth: { token }
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join-session', roomId);
        });

        socket.on('session-init', (data) => {
            setElements(data.canvasData);
            setParticipants(data.participants);
        });

        socket.on('draw-action', (data: { element: WhiteboardElement }) => {
            setElements((prev) => [...prev, data.element]);
        });

        socket.on('update-element', (data: { elementId: string, updates: Partial<WhiteboardElement> }) => {
            setElements((prev) =>
                prev.map((el) => el.id === data.elementId ? { ...el, ...data.updates } : el)
            );
        });

        socket.on('board-cleared', () => {
            setElements([]);
        });

        socket.on('user-joined', (user) => {
            setParticipants((prev) => [...prev, user]);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId]);

    const addElement = useCallback((element: WhiteboardElement) => {
        setElements((prev) => [...prev, element]);
        socketRef.current?.emit('draw-action', { roomId, element });
    }, [roomId]);

    const updateElement = useCallback((elementId: string, updates: Partial<WhiteboardElement>) => {
        setElements((prev) =>
            prev.map((el) => el.id === elementId ? { ...el, ...updates } : el)
        );
        socketRef.current?.emit('update-element', { roomId, elementId, updates });
    }, [roomId]);

    const clearBoard = useCallback(() => {
        setElements([]);
        socketRef.current?.emit('clear-board', roomId);
    }, [roomId]);

    const sendCursor = useCallback((x: number, y: number) => {
        socketRef.current?.emit('cursor-move', { roomId, x, y });
    }, [roomId]);

    return {
        elements,
        participants,
        isConnected,
        addElement,
        updateElement,
        clearBoard,
        sendCursor,
        socket: socketRef.current
    };
};
