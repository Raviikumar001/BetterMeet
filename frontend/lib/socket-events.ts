export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  USER_JOINED: 'new-peer',
  USER_LEFT: 'peer-left',
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice',
  CHAT_MESSAGE: 'chat-message',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
