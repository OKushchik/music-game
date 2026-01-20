import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GamePlayer = {
  id: string;
  fullName: string;
  years: number[];
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
    setYearsForPlayer: (state, action: PayloadAction<{ playerId: string; year: number }>) => {
      const { playerId, year } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        if (!player?.years.includes(year)) {
          player.years.push(year);
        }
      }
    }
  },
});

export const { setGamePlayers, clearGamePlayers, setYearsForPlayer } = gameSlice.actions;
export default gameSlice.reducer;

