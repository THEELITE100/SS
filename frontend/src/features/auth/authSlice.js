import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { authApi } from './authApi';
import { setAccessToken } from '../../api/axiosInstance';

// Runs once on app load: tries to trade the httpOnly refresh cookie for a
// fresh access token, so a page reload doesn't force a re-login.
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const refreshRes = await authApi.refresh();
    const token = refreshRes.data.data.accessToken;
    setAccessToken(token);
    const meRes = await authApi.getMe();
    return { user: meRes.data.data.user, accessToken: token };
  } catch {
    return rejectWithValue(null);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(payload);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const verifyLogin2FA = createAsyncThunk('auth/verifyLogin2FA', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.verifyLogin2FA(payload);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Invalid code');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const initialState = {
  user: null,
  accessToken: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,
  twoFactorChallenge: null, // holds the challenge token while 2FA is pending
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
      setAccessToken(action.payload.accessToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
      state.twoFactorChallenge = null;
      setAccessToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'unauthenticated';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
        setAccessToken(action.payload.accessToken);
        toast.success('Account created! Check your email to verify.');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload;
        toast.error(action.payload || 'Registration failed');
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload.twoFactorRequired) {
          state.status = 'unauthenticated';
          state.twoFactorChallenge = action.payload.challengeToken;
          return;
        }
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
        setAccessToken(action.payload.accessToken);
        toast.success('Welcome back!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload;
        toast.error(action.payload || 'Login failed');
      })
      .addCase(verifyLogin2FA.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
        state.twoFactorChallenge = null;
        setAccessToken(action.payload.accessToken);
        toast.success('Welcome back!');
      })
      .addCase(verifyLogin2FA.rejected, (state, action) => {
        toast.error(action.payload || 'Invalid code');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'unauthenticated';
        setAccessToken(null);
        toast.success('Logged out');
      });
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
