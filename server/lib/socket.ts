import { Server } from 'socket.io';
import http from 'http';
import { env } from "../utils/configService";
import crypto from "node:crypto";

let io: Server | null = null;

type Player = { id: string; name: string; years?: string[] };

interface RoundState {
  trackIndex: number | null; // index into playlist
  insertYear: string | null; // ISO date string, e.g. "1999-01-01"
  activePlayerId: string | null;
}

type Room = {
  players: Player[];
  trackId: string,
  currentRound: RoundState;
};

function createEmptyRoom(trackId: string): Room {
  return {
    players: [],
    trackId: trackId,
    currentRound: {
      trackIndex: null,
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
    socket.on("create_room", (trackId) => {
      const roomId = crypto.randomUUID();
      const room = createEmptyRoom(trackId);
      rooms.set(roomId, room);
      socket.join(roomId);
      socket.emit("room_created", {roomId,trackId});
      io?.to(roomId).emit("players_in_room", room.players);
      console.log(`Room created with ID: ${roomId} by socket: ${socket.id} rooms count: ${rooms}`);
    });

    socket.on("add_track-list", (roomId, trackListId) => {
        if (trackListId && typeof trackListId === "string") {
          const room = rooms.get(roomId);
          if (!room) return;
          room.trackId = trackListId;
        }

    })

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

      // Match players by id only to avoid collisions on default names.
      const existingPlayer = room.players.find((player) => player.id === user.id);

      if (!existingPlayer) {
        const newPlayer: Player = {
          id: user.id,
          name: typeof user.name === "string" && user.name.trim() ? user.name : "Player",
          years: [],
        };
        room.players.push(newPlayer);
        console.log(`Added new player to room ${roomId}:`, newPlayer);
        // If a round insertYear was already initialized, give it to this joining player
        if (room.currentRound.insertYear && (!newPlayer.years || newPlayer.years.length === 0)) {
          newPlayer.years = [room.currentRound.insertYear];
        }
      } else {
        // Ensure years exists, and update name if provided in the join payload
        if (!existingPlayer.years) existingPlayer.years = [];
        if (typeof user.name === 'string' && user.name.trim() && existingPlayer.name !== user.name) {
          console.log(`Updating name for player ${existingPlayer.id} from '${existingPlayer.name}' to '${user.name}'`);
          existingPlayer.name = user.name;
        }
        // If a round insertYear exists and the existing player's years are empty, initialize them
        if (room.currentRound.insertYear && existingPlayer.years.length === 0) {
          existingPlayer.years = [room.currentRound.insertYear];
        }
      }

      // If no active player yet, set the first player's id as active
      if (!room.currentRound.activePlayerId && room.players.length > 0) {
        room.currentRound.activePlayerId = room.players[0].id;
      }

      socket.join(roomId);

      io?.to(roomId).emit("player_joined", socket.id);
      io?.to(roomId).emit("players_in_room", room.players);
      socket.emit("game_state", room.currentRound);
      socket.emit("room_info", { roomId, trackId: room.trackId });
      console.log(`Current players in room ${roomId}:`, room.players);
    });

    // Client asks for full game state explicitly
    socket.on('request_game_state', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      socket.emit('game_state', room.currentRound);
      socket.emit('room_info', { roomId, trackId: room.trackId });
    });

    // Host (or any client) starts/updates a round with chosen track and insertYear
    socket.on('set_round', ({ roomId, trackIndex, insertYear, activePlayerId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Determine current active index and advance to next for the new round
      const currentIndex = room.currentRound.activePlayerId
        ? room.players.findIndex(p => p.id === room.currentRound.activePlayerId)
        : -1;
      const nextIndex = (currentIndex + 1) % (room.players.length || 1);
      const nextPlayer = room.players[nextIndex];

      room.currentRound = {
        trackIndex: typeof trackIndex === 'number' ? trackIndex : null,
        insertYear: insertYear ?? null,
        activePlayerId: nextPlayer ? nextPlayer.id : activePlayerId ?? null,
      };

      io?.to(roomId).emit('game_state', room.currentRound);
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

    // Initialize a year for all players in room (e.g., first random year)
    socket.on('init_year', ({ roomId, year }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      if (!room.players.length) return;

      // Store the chosen insert year in the room state so future joiners can receive it
      room.currentRound.insertYear = year;

      // Only set the initial year for players who don't yet have any years
      room.players.forEach(player => {
        if (!player.years || player.years.length === 0) {
          player.years = [year];
        }
      });

      io?.to(roomId).emit('players_in_room', room.players);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('message', (payload) => {
      console.log('Received message from client:', payload);
      socket.emit('message', `Server received: ${payload}`);
    });

    socket.on('next_round', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      if (!room.players.length) return;

      // Determine current active index
      const currentIndex = room.currentRound.activePlayerId
        ? room.players.findIndex(p => p.id === room.currentRound.activePlayerId)
        : -1;

      // Advance with wrap-around (handles currentIndex === -1)
      const playersCount = room.players.length;
      const nextIndex = (currentIndex + 1 + playersCount) % playersCount;
      const nextPlayer = room.players[nextIndex];

      // Safely set active player id
      room.currentRound.activePlayerId = nextPlayer ? nextPlayer.id : null;

      io?.to(roomId).emit('game_state', room.currentRound);
    });
  });

  return io;
}
