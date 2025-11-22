import { useState, useCallback, useEffect } from 'react';
import { MEDIA_CONSTRAINTS } from '@/lib/media-constraints';

interface MediaStreamHook {
    stream: MediaStream | null;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    getMediaStream: () => Promise<MediaStream | null>;
    stopMediaStream: () => void;
}

export const useMediaStream = (): MediaStreamHook => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const getMediaStream = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
            setStream(mediaStream);
            return mediaStream;
        } catch (error) {
            console.error('❌ Error accessing media:', error);
            return null;
        }
    }, []);

    const stopMediaStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    const toggleAudio = useCallback(() => {
        if (stream) {
            stream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled((prev) => !prev);
        }
    }, [stream]);

    const toggleVideo = useCallback(() => {
        if (stream) {
            stream.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled((prev) => !prev);
        }
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    return {
        stream,
        isAudioEnabled,
        isVideoEnabled,
        toggleAudio,
        toggleVideo,
        getMediaStream,
        stopMediaStream,
    };
};
