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

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on("create_room", () => {
      const roomId = crypto.randomUUID();

      rooms.set(roomId, {
        players: [socket.id]
      });

      socket.join(roomId);
      socket.emit("room_created", roomId);
      console.log(`Room created with ID: ${roomId} by socket: ${socket.id}`);
    });


    socket.on("join_room", ({ roomId, name }) => {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error_msg", "Room not found");
        return;
      }
      if (!room.players.includes(socket.id)) {
        room.players.push({ roomId, name });
      }
      socket.join(roomId);

      io?.to(roomId).emit("player_joined", socket.id);
      io?.to(roomId).emit("players_in_room", room.players);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      console.log(`Current players in room ${roomId}:`, room.players);
    });


    socket.on('players_in_room', (playersList: string[]) => {
      console.log('Received players in room:', playersList);
    });


    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('message', (payload) => {
      console.log('Received message from client:', payload);
      socket.emit('message', `Server received: ${payload}`);
    });
  });

  return io;
}
