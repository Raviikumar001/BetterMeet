import React from 'react';
import { LocalVideo } from './LocalVideo';
import { RemoteVideo } from './RemoteVideo';

interface GridLayoutProps {
    localStream: MediaStream | null;
    remoteStreams: Map<string, MediaStream>;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
}

export const GridLayout = ({
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
}: GridLayoutProps) => {
    const remotePeers = Array.from(remoteStreams.entries());
    const totalPeers = 1 + remotePeers.length; // Local + Remote

    // Dynamic grid class based on number of participants
    const getGridClass = () => {
        if (totalPeers === 1) return 'grid-cols-1';
        if (totalPeers === 2) return 'grid-cols-1 md:grid-cols-2';
        if (totalPeers <= 4) return 'grid-cols-2';
        return 'grid-cols-2 md:grid-cols-3';
    };

    return (
        <div className={`grid gap-4 w-full h-full p-4 ${getGridClass()}`}>
            {/* Local Video */}
            <div className="w-full h-full min-h-[300px]">
                <LocalVideo
                    stream={localStream}
                    isMuted={!isAudioEnabled}
                    isVideoOff={!isVideoEnabled}
                />
            </div>

            {/* Remote Videos */}
            {remotePeers.map(([peerId, stream]) => (
                <div key={peerId} className="w-full h-full min-h-[300px]">
                    <RemoteVideo stream={stream} peerId={peerId} />
                </div>
            ))}
        </div>
    );
};
