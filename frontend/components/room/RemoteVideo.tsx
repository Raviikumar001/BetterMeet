import { useEffect, useRef } from 'react';

interface RemoteVideoProps {
    stream: MediaStream | null;
    peerId: string;
}

export const RemoteVideo = ({ stream, peerId }: RemoteVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
                    <span className="text-gray-400">Waiting for video...</span>
                </div>
            )}

            <div className="absolute bottom-4 left-4">
                <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
                    Peer {peerId.slice(0, 4)}
                </div>
            </div>
        </div>
    );
};
