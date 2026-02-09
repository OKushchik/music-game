import { Server } from 'socket.io';
import http from 'http';
import {env} from "../utils/configService";

let io: Server | null = null;

export function initSocket(httpServer: http.Server) {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('message', (payload) => {
      console.log('Received message from client:', payload);
      // Echo back
      socket.emit('message', `Server received: ${payload}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket first.');
  return io;
}
