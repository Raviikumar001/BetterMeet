interface ControlsProps {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    onLeave: () => void;
}

export const Controls = ({
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    onLeave,
}: ControlsProps) => {
    return (
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800">
            <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-all duration-200 ${isAudioEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
            >
                {isAudioEnabled ? '🎤' : '🔇'}
            </button>

            <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all duration-200 ${isVideoEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
            >
                {isVideoEnabled ? '📹' : '🚫'}
            </button>

            <button
                onClick={onLeave}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-200"
            >
                Leave Call
            </button>
        </div>
    );
};
