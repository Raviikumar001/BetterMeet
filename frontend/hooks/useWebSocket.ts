import { useEffect, useRef, useState, useCallback } from 'react';
import { SOCKET_EVENTS } from '@/lib/socket-events';

interface WebSocketHook {
    socket: WebSocket | null;
    isConnected: boolean;
    sendMessage: (type: string, data: any, to?: string) => void;
}

export const useWebSocket = (roomId: string, peerId: string): WebSocketHook => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        if (!roomId || !peerId) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
        const url = `${wsUrl}/ws/${roomId}/${peerId}`;

        console.log('🔌 Connecting to WebSocket:', url);
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('✅ WebSocket Connected');
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log('❌ WebSocket Disconnected');
            setIsConnected(false);
            // Attempt reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('🔄 Attempting reconnect...');
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('⚠️ WebSocket Error:', error);
        };

        socketRef.current = ws;
    }, [roomId, peerId]);

    useEffect(() => {
        // Prevent double connection in Strict Mode
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        connect();

        return () => {
            // Only close if we're actually unmounting, but in Strict Mode
            // we want to be careful. For now, we'll close it to be safe,
            // but the connect function should handle the re-connection gracefully.
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    const sendMessage = useCallback((type: string, data: any, to?: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type,
                room: roomId,
                from: peerId,
                to,
                data,
            };
            socketRef.current.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ Cannot send message, WebSocket not open');
        }
    }, [roomId, peerId]);

    return { socket: socketRef.current, isConnected, sendMessage };
};
