'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const createNewMeeting = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    router.push(`/room/${newRoomId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-gradient-to-b from-gray-900 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-900 lg:p-4">
          <code className="font-mono font-bold">Record Meet</code>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-blue-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-blue-900 after:via-blue-800 after:opacity-40 after:blur-2xl after:content-[''] z-[-1]">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Video calls for everyone.
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Connect, collaborate, and record your meetings with high-quality video and audio. No sign-up required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={createNewMeeting}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              <span>📹</span> New Meeting
            </button>

            <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
              <span className="pl-3 text-gray-500">⌨️</span>
              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter a code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-32"
                />
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className="px-4 py-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 font-medium transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left mt-24 gap-8">
        <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-700 hover:bg-gray-900/50">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Real-time{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Low latency video and audio powered by WebRTC.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-700 hover:bg-gray-900/50">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Secure{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            End-to-end encrypted peer-to-peer connections.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-700 hover:bg-gray-900/50">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Open Source{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Built with Next.js and Go. Fully customizable.
          </p>
        </div>
      </div>
    </main>
  );
}
