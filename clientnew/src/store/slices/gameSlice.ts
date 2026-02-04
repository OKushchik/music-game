import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GamePlayer = {
  id: string;
  fullName: string;
  years: string[];
};

interface GameState {
  players: GamePlayer[];
}

const initialState: GameState = {
  players: [],
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGamePlayers: (state, action: PayloadAction<Array<{ id: string; fullName: string }>>) => {
      // Додаємо порожній масив years кожному гравцю
      state.players = action.payload.map(player => ({
        ...player,
        years: [],
      }));
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

export const { setGamePlayers, clearGamePlayers, initYearForPlayer, addYearForPlayer } = gameSlice.actions;
export default gameSlice.reducer;
