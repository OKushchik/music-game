import { configureStore } from '@reduxjs/toolkit';
import songsReducer from '@/src/store/slices/songsSlice';
import authReducer from '@/src/store/slices/authSlice';
import gameReducer from '@/src/store/slices/gameSlice';

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      songs: songsReducer,
      auth: authReducer,
      game: gameReducer,
    },
  });

  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('app_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);

        if (parsedState.songs) {
          store.dispatch({
            type: 'songs/setSongs',
            payload: parsedState.songs,
          });
        }

        if (parsedState.auth) {
          store.dispatch({
            type: 'auth/setAuth',
            payload: parsedState.auth,
          });
        }

        if (parsedState.game?.players) {
          store.dispatch({
            type: 'game/setGamePlayers',
            payload: parsedState.game.players,
          });
        }
        if (parsedState.game?.trackId) {
          store.dispatch({
            type: 'game/addTrackId',
            payload: parsedState.game.trackId,
          });
        }

      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
      }
    }
  }

  store.subscribe(() => {
    if (typeof window !== 'undefined') {
      const state = store.getState();

      if (!state.auth.user) {
        localStorage.removeItem('app_state');
        return;
      }

      localStorage.setItem('app_state', JSON.stringify({
        songs: state.songs,
        auth: state.auth,
        game: {
          trackId: state.game.trackId,
          players: state.game.players
        }
      }));
    }
  });

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
