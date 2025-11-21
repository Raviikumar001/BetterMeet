import { useEffect, useRef, useState, useCallback } from 'react';
import { RTC_CONFIG, MEDIA_CONSTRAINTS } from '@/lib/rtc-config';
import { SOCKET_EVENTS } from '@/lib/socket-events';

interface WebRTCHook {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    peerConnection: RTCPeerConnection | null;
    startCall: () => Promise<void>;
    endCall: () => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
}

export const useWebRTC = (
    roomId: string,
    peerId: string,
    socket: WebSocket | null,
    sendMessage: (type: string, data: any, to?: string) => void
): WebRTCHook => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
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

    // Initialize local media
    const startCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error('❌ Error accessing media:', error);
            return null;
        }
    }, []);

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

                    // Get local media if not already available
                    if (!localStream) {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
                            setLocalStream(stream);
                            stream.getTracks().forEach((track) => pc2.addTrack(track, stream));
                        } catch (err) {
                            console.error('❌ Error getting local media for answer:', err);
                        }
                    } else {
                        localStream.getTracks().forEach((track) => pc2.addTrack(track, localStream));
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
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(msg.data));
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
        localStream?.getTracks().forEach((track) => track.stop());
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        setRemotePeerId(null);
    }, [localStream]);

    const toggleAudio = useCallback(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
            setIsAudioEnabled((prev) => !prev);
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
            setIsVideoEnabled((prev) => !prev);
        }
    }, [localStream]);

    return {
        localStream,
        remoteStream,
        peerConnection: peerConnectionRef.current,
        startCall,
        endCall,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
    };
};
