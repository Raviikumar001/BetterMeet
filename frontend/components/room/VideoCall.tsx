'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMediaStream } from '@/hooks/useMediaStream';
import { LocalVideo } from './LocalVideo';
import { RemoteVideo } from './RemoteVideo';
import { Controls } from './Controls';
import { useRouter } from 'next/navigation';

interface VideoCallProps {
    roomId: string;
    peerId: string;
}

export const VideoCall = ({ roomId, peerId }: VideoCallProps) => {
    const router = useRouter();
    const { socket, isConnected, sendMessage } = useWebSocket(roomId, peerId);

    const {
        stream: localStream,
        isAudioEnabled,
        isVideoEnabled,
        toggleAudio,
        toggleVideo,
        getMediaStream,
        stopMediaStream,
    } = useMediaStream();

    const {
        remoteStream,
        endCall,
    } = useWebRTC(roomId, peerId, socket, sendMessage, localStream);

    const [hasJoined, setHasJoined] = useState(false);

    const handleJoin = async () => {
        await getMediaStream();
        setHasJoined(true);
    };

    const handleLeave = () => {
        endCall();
        stopMediaStream();
        router.push('/');
    };

    if (!hasJoined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
                <div className="max-w-md w-full p-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 text-center">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Ready to join?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        You are about to join room <span className="font-mono text-blue-400">{roomId}</span>
                    </p>
                    <button
                        onClick={handleJoin}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                    >
                        Join Meeting
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white p-4 gap-4">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-800/50">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-gray-400">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <div className="font-mono text-gray-500 text-sm">
                    Room: {roomId}
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <LocalVideo
                    stream={localStream}
                    isMuted={!isAudioEnabled}
                    isVideoOff={!isVideoEnabled}
                />
                <RemoteVideo stream={remoteStream} peerId="Remote" />
            </div>

            {/* Controls */}
            <div className="flex justify-center pb-4">
                <Controls
                    isAudioEnabled={isAudioEnabled}
                    isVideoEnabled={isVideoEnabled}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    onLeave={handleLeave}
                />
            </div>
        </div>
    );
};
