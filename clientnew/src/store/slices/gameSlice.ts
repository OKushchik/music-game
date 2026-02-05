import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {GamePlayer, GameState} from "@/src/models/models";


const initialState: GameState = {
  trackId: '',
  players: [],
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addTrackId: (state, action: PayloadAction<string>) => {
      state.trackId = action.payload;
    },
    setGamePlayers: (state, action: PayloadAction<Array<{ id: string; fullName: string; years?: string[] }>>) => {
      const playersWithYears: GamePlayer[] = action.payload.map(player => ({
        id: player.id,
        fullName: player.fullName,
        years: player.years ?? [],
      }));

      state.players = playersWithYears;
    },
    clearGamePlayers: (state) => {
      state.players = [];
    },
    initYearForPlayer: (
      state,
      action: PayloadAction<{ playerId: string; year: string }>
    ) => {
      const { playerId, year } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (!player) return;

      if (player.years.length === 0) {
        player.years.push(year);
      }
    },
    addYearForPlayer: (
      state,
      action: PayloadAction<{ playerId: string; year: string }>
    ) => {
      const { playerId, year } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (!player) return;

      if (!player.years.includes(year)) {
        player.years.push(year);
      }
    },
  },
});

export const { addTrackId, setGamePlayers, clearGamePlayers, initYearForPlayer, addYearForPlayer } = gameSlice.actions;
export default gameSlice.reducer;
