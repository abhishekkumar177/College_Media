import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { collabApi } from '../api/endpoints';
import { toast } from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000/collab';

export const useCollab = (docId: string | null) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [ydoc] = useState(() => new Y.Doc());
    const [isConnected, setIsConnected] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [title, setTitle] = useState('Untitled');

    // Initialize Socket
    useEffect(() => {
        if (!token || !docId) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            forceNew: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to Collab Namespace');
            setIsConnected(true);
            newSocket.emit('join-document', docId);
        });

        newSocket.on('error', (err) => {
            console.error('Socket Error:', err);
            toast.error('Connection error');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setCollaborators([]);
            setIsConnected(false);
        };
    }, [token, docId]);

    // Handle Document Sync
    useEffect(() => {
        if (!socket || !docId) return;

        // 1. Initial Load
        socket.on('doc-load', ({ content }) => {
            if (content) {
                // Apply initial state
                Y.applyUpdate(ydoc, new Uint8Array(content.data)); // Buffer to Uiit8Array
            }
        });

        // 2. Listen for updates from others
        socket.on('doc-update', ({ update }) => {
            // Apply remote update
            Y.applyUpdate(ydoc, new Uint8Array(update.data));
        });

        // 3. User awareness
        socket.on('user-joined', (user) => {
            setCollaborators(prev => [...prev.filter(u => u.userId !== user.userId), user]);
            toast.success(`${user.username} joined`);
        });

        socket.on('user-left', (user) => {
            setCollaborators(prev => prev.filter(u => u.userId !== user.userId));
        });

        // 4. Capture local updates and send to server
        const handleUpdate = (update: Uint8Array, origin: any) => {
            if (origin !== 'remote') { // Only send local changes
                socket.emit('doc-update', {
                    docId,
                    update: Buffer.from(update) // Send as buffer 
                });
            }
        };

        ydoc.on('update', handleUpdate);

        return () => {
            socket.off('doc-load');
            socket.off('doc-update');
            socket.off('user-joined');
            socket.off('user-left');
            ydoc.off('update', handleUpdate);
        };
    }, [socket, docId, ydoc]);

    // Save periodically (Debounced in a real app, explicit here for safety)
    const saveDocument = () => {
        if (socket && docId) {
            const state = Y.encodeStateAsUpdate(ydoc);
            socket.emit('save-document', {
                docId,
                content: Buffer.from(state)
            });
            toast.success('Document saved');
        }
    };

    return {
        ydoc,
        socket,
        isConnected,
        collaborators,
        saveDocument,
        title,
        setTitle
    };
};
