import { Server } from 'socket.io';
import http from 'http';
import { env } from "../utils/configService";
import crypto from "node:crypto";

let io: Server | null = null;

type Player = { id: string; name: string; years?: string[] };

interface RoundState {
  trackId: string | null;
  insertYear: string | null; // ISO date string, e.g. "1999-01-01"
  activePlayerId: string | null;
}

type Room = {
  players: Player[];
  currentRound: RoundState;
};

function createEmptyRoom(): Room {
  return {
    players: [],
    currentRound: {
      trackId: null,
      insertYear: null,
      activePlayerId: null,
    },
  };
}

export function initSocket(httpServer: http.Server) {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const rooms = new Map<string, Room>();

  io.on('connection', (socket) => {
    socket.on("create_room", () => {
      const roomId = crypto.randomUUID();

      rooms.set(roomId, createEmptyRoom());

      socket.join(roomId);
      socket.emit("room_created", roomId);
      io?.to(roomId).emit("players_in_room", rooms.get(roomId)!.players);
      console.log(`Room created with ID: ${roomId} by socket: ${socket.id}`);
    });

    socket.on("join_room", ({ roomId, user }) => {
      if (!roomId || typeof roomId !== "string") {
        socket.emit("error_msg", "Invalid roomId");
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error_msg", "Room not found");
        return;
      }

      if (!user || typeof user.id !== "string") {
        socket.emit("error_msg", "Invalid user");
        return;
      }

      const normalizedUser: Player = {
        id: user.id,
        name: typeof user.name === "string" && user.name.trim() ? user.name : "Player",
        years: [],
      };

      if (!room.players.some((p) => p.id === normalizedUser.id)) {
        room.players.push(normalizedUser);
      }

      socket.join(roomId);

      io?.to(roomId).emit("player_joined", socket.id);
      io?.to(roomId).emit("players_in_room", room.players);
      // Also send current game state to the joining client
      socket.emit("game_state", room.currentRound);
      console.log(`Current players in room ${roomId}:`, room.players);
    });

    // Client asks for full game state explicitly
    socket.on('request_game_state', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      socket.emit('game_state', room.currentRound);
    });

    // Host (or any client) starts/updates a round with chosen track and insertYear
    socket.on('set_round', ({ roomId, trackIndex, insertYear, activePlayerId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.currentRound = {
        trackId: trackIndex ?? null, // reuse field as index or extend type if needed
        insertYear: insertYear ?? null,
        activePlayerId: activePlayerId ?? null,
      } as any;

      io?.to(roomId).emit('game_state', {
        trackIndex: trackIndex ?? null,
        insertYear: insertYear ?? null,
        activePlayerId: activePlayerId ?? null,
      });
    });

    // Add year to player in room (and sync players list)
    socket.on('add_year', ({ roomId, playerId, year }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (!player) return;
      if (!player.years) player.years = [];
      if (!player.years.includes(year)) player.years.push(year);
      io?.to(roomId).emit('players_in_room', room.players);
    });

    // Reorder players in room
    socket.on('reorder_players', ({ roomId, newOrder }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const idToPlayer = Object.fromEntries(room.players.map(p => [p.id, p]));
      room.players = newOrder.map((id: string) => idToPlayer[id]).filter(Boolean);
      io?.to(roomId).emit('players_in_room', room.players);
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
