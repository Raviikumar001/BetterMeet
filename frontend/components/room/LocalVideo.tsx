import { useEffect, useRef } from 'react';

interface LocalVideoProps {
    stream: MediaStream | null;
    isMuted: boolean;
    isVideoOff: boolean;
}

export const LocalVideo = ({ stream, isMuted, isVideoOff }: LocalVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`}
            />

            {/* Avatar fallback when video is off */}
            {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                        You
                    </div>
                </div>
            )}

            {/* Status indicators */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white flex items-center gap-2">
                    You {isMuted && <span className="text-red-500">mic off</span>}
                </div>
            </div>
        </div>
    );
};
