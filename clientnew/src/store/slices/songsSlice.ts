import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Song {
  _id?: string;
  title: string;
  year: number;
  link: string;
  createdAt?: string;
}

interface SongsState {
  songs: Song[];
}
const initialState:SongsState = {
  songs: [],
};

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    getAllSongsAction: (state, action: PayloadAction<Song[]>) => {
      state.songs = action.payload;
    },
    deleteSongAction: (state, action: PayloadAction<string>) => {
      state.songs = state.songs.filter(song => song._id !== action.payload);
    },
    addSongAction: (state, action: PayloadAction<Song>) => {
      state.songs.push( action.payload);
    },
  },
});

export const { getAllSongsAction, addSongAction, deleteSongAction } = songsSlice.actions;
export default songsSlice.reducer;
