import { useEffect, useRef, useState, useCallback } from 'react';
import { RTC_CONFIG } from '@/lib/rtc-config';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import { MEDIA_CONSTRAINTS } from '@/lib/media-constraints';

interface WebRTCHook {
    remoteStreams: Map<string, MediaStream>;
    peerConnections: Map<string, RTCPeerConnection>;
    endCall: () => void;
}

export const useWebRTC = (
    roomId: string,
    peerId: string,
    socket: WebSocket | null,
    sendMessage: (type: string, data: any, to?: string) => void,
    localStream: MediaStream | null
): WebRTCHook => {
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

    // Helper to update streams map
    const addRemoteStream = useCallback((peerId: string, stream: MediaStream) => {
        setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(peerId, stream);
            return newMap;
        });
    }, []);

    const removeRemoteStream = useCallback((peerId: string) => {
        setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(peerId);
            return newMap;
        });
    }, []);

    // Initialize PeerConnection
    const createPeerConnection = useCallback((targetPeerId: string) => {
        if (peerConnections.current.has(targetPeerId)) {
            return peerConnections.current.get(targetPeerId)!;
        }

        console.log('🛠️ Creating RTCPeerConnection for:', targetPeerId);
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('❄️ Sending ICE candidate to:', targetPeerId);
                sendMessage(SOCKET_EVENTS.ICE_CANDIDATE, event.candidate, targetPeerId);
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('🎥 Received remote track from:', targetPeerId);
            addRemoteStream(targetPeerId, event.streams[0]);
        };

        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log(`🧊 ICE Connection State (${targetPeerId}):`, pc.iceConnectionState);
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                removeRemoteStream(targetPeerId);
            }
        };

        peerConnections.current.set(targetPeerId, pc);
        return pc;
    }, [sendMessage, addRemoteStream, removeRemoteStream]);

    // Handle incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleMessage = async (event: MessageEvent) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case SOCKET_EVENTS.USER_JOINED: // "new-peer"
                    console.log('👋 New peer joined:', msg.data);
                    const targetPeerId = msg.data;

                    // Initiate connection
                    const pc = createPeerConnection(targetPeerId);
                    if (localStream) {
                        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
                    }

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    console.log('📤 Sending Offer to:', targetPeerId);
                    sendMessage(SOCKET_EVENTS.OFFER, offer, targetPeerId);
                    break;

                case SOCKET_EVENTS.OFFER:
                    console.log('📥 Received Offer from:', msg.from);
                    const senderPeerId = msg.from;
                    const pc2 = createPeerConnection(senderPeerId);

                    // Add local tracks if available
                    if (localStream) {
                        localStream.getTracks().forEach((track) => pc2.addTrack(track, localStream));
                    } else {
                        console.warn('⚠️ Answering offer without local stream');
                    }

                    await pc2.setRemoteDescription(new RTCSessionDescription(msg.data));
                    const answer = await pc2.createAnswer();
                    await pc2.setLocalDescription(answer);

                    console.log('📤 Sending Answer to:', senderPeerId);
                    sendMessage(SOCKET_EVENTS.ANSWER, answer, senderPeerId);
                    break;

                case SOCKET_EVENTS.ANSWER:
                    console.log('📥 Received Answer from:', msg.from);
                    const answerSenderId = msg.from;
                    const pc3 = peerConnections.current.get(answerSenderId);
                    if (pc3) {
                        await pc3.setRemoteDescription(new RTCSessionDescription(msg.data));
                    }
                    break;

                case SOCKET_EVENTS.ICE_CANDIDATE:
                    console.log('❄️ Received ICE Candidate from:', msg.from);
                    const candidateSenderId = msg.from;
                    const pc4 = peerConnections.current.get(candidateSenderId);
                    if (pc4) {
                        try {
                            await pc4.addIceCandidate(new RTCIceCandidate(msg.data));
                        } catch (err) {
                            console.error('❌ Error adding ICE candidate:', err);
                        }
                    }
                    break;

                case SOCKET_EVENTS.USER_LEFT:
                    console.log('👋 Peer left:', msg.data);
                    const leftPeerId = msg.data;
                    removeRemoteStream(leftPeerId);
                    const pcToClose = peerConnections.current.get(leftPeerId);
                    if (pcToClose) {
                        pcToClose.close();
                        peerConnections.current.delete(leftPeerId);
                    }
                    break;
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, createPeerConnection, sendMessage, localStream, removeRemoteStream]);

    const endCall = useCallback(() => {
        peerConnections.current.forEach((pc) => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());
    }, []);

    return {
        remoteStreams,
        peerConnections: peerConnections.current,
        endCall,
    };
};
