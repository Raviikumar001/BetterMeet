'use client';

import { use, useState, useEffect } from 'react';
import { VideoCall } from '@/components/room/VideoCall';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const [peerId, setPeerId] = useState<string>('');

    useEffect(() => {
        // Generate a random peer ID for now (Phase 1)
        setPeerId(Math.random().toString(36).substring(7));
    }, []);

    if (!peerId) return null;

    return <VideoCall roomId={resolvedParams.id} peerId={peerId} />;
}
