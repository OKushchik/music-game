import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllSongsAPI, addSongAPI, deleteSongAPI, deleteManySongsAPI } from '@/src/services/api/songsApi';
import { Song } from '@/src/models/models';

export const fetchAllSongs = createAsyncThunk('songs/fetchAllSongs', async (_, { rejectWithValue }) => {
  console.log('fetchAllSongs thunk called');
  try {
    const data = await getAllSongsAPI();
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const addSong = createAsyncThunk('songs/addSong', async (payload: Song, { rejectWithValue }) => {
  try {
    const data = await addSongAPI(payload);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteSong = createAsyncThunk('songs/deleteSong', async (id: string, { rejectWithValue }) => {
  try {
    const data = await deleteSongAPI(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteManySongs = createAsyncThunk('songs/deleteManySongs', async (ids: string[], { rejectWithValue }) => {
  try {
    const data = await deleteManySongsAPI(ids);
    return ids;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

interface SongsState {
  songs: Song[];
  loading: boolean;
  error?: any;
}

const initialState: SongsState = {
  songs: [],
  loading: false,
  error: null,
};

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSongs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = action.payload;
      })
      .addCase(fetchAllSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSong.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSong.fulfilled, (state, action) => {
        state.loading = false;
        state.songs.push(action.payload);
      })
      .addCase(addSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSong.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = state.songs.filter(song => song._id !== action.payload);
      })
      .addCase(deleteSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteManySongs.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManySongs.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = state.songs.filter(song => !action.payload.includes(song._id || ''));
      })
      .addCase(deleteManySongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearError } = songsSlice.actions;
export default songsSlice.reducer;
