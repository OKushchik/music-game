import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {loginAPI, registerAPI, logoutAPI, getCurrentUser} from '@/src/services/api/authApi';
import {User} from "@/src/models/models";

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const data = await getCurrentUser();
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (payload: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const data = await loginAPI(payload as any);
    const { refreshToken, ...user } = data.data;
    localStorage.setItem("refresh_token", refreshToken);
    return user;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload: any, { rejectWithValue }) => {
  try {
    const data = await registerAPI(payload);
    console.log('Registration data:', data);
    const { refreshToken, ...user } = data.data;
    localStorage.setItem("refresh_token", refreshToken);
    return user;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('app_state');
    await logoutAPI();
    return null;
  } catch (err: any) {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('app_state');
    return rejectWithValue(err.response?.data || err.message);
  }
});

interface AuthState {
  user: User | null;
  loading: boolean;
  isInitialized: boolean,
  error?: any;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearAllState(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isInitialized = true;
      })
///////////
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
///////////
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
///////////
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
  }
});

export const { clearError, clearAllState } = authSlice.actions;
export default authSlice.reducer;
