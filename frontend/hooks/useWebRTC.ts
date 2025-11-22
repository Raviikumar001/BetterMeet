import { useEffect, useRef, useState, useCallback } from 'react';
import { RTC_CONFIG } from '@/lib/rtc-config';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import { MEDIA_CONSTRAINTS } from '@/lib/media-constraints';

interface WebRTCHook {
    remoteStream: MediaStream | null;
    peerConnection: RTCPeerConnection | null;
    endCall: () => void;
}

export const useWebRTC = (
    roomId: string,
    peerId: string,
    socket: WebSocket | null,
    sendMessage: (type: string, data: any, to?: string) => void,
    localStream: MediaStream | null
): WebRTCHook => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [remotePeerId, setRemotePeerId] = useState<string | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // Initialize PeerConnection
    const createPeerConnection = useCallback((targetPeerId: string) => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

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
            console.log('🎥 Received remote track');
            setRemoteStream(event.streams[0]);
        };

        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log('🧊 ICE Connection State:', pc.iceConnectionState);
        };

        peerConnectionRef.current = pc;
        setRemotePeerId(targetPeerId);
        return pc;
    }, [sendMessage]);

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
                    console.log('📥 Received Answer');
                    if (peerConnectionRef.current) {
                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(msg.data));
                    }
                    break;

                case SOCKET_EVENTS.ICE_CANDIDATE:
                    console.log('❄️ Received ICE Candidate');
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(msg.data));
                        } catch (err) {
                            console.error('❌ Error adding ICE candidate:', err);
                        }
                    }
                    break;

                case SOCKET_EVENTS.USER_LEFT:
                    console.log('👋 Peer left:', msg.data);
                    if (remotePeerId === msg.data) {
                        setRemoteStream(null);
                        setRemotePeerId(null);
                        if (peerConnectionRef.current) {
                            peerConnectionRef.current.close();
                            peerConnectionRef.current = null;
                        }
                    }
                    break;
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, createPeerConnection, sendMessage, localStream, remotePeerId]);

    const endCall = useCallback(() => {
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        setRemoteStream(null);
        setRemotePeerId(null);
    }, []);

    return {
        remoteStream,
        peerConnection: peerConnectionRef.current,
        endCall,
    };
};
