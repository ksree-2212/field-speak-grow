import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  phone: string;
  name?: string;
  location?: string;
  farmSize?: number;
  primaryCrops?: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  onboardingComplete: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  onboardingComplete: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
    },
    loginFailure: (state) => {
      state.isLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.onboardingComplete = false;
    },
    completeOnboarding: (state) => {
      state.onboardingComplete = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  completeOnboarding,
  updateUser 
} = authSlice.actions;

export default authSlice.reducer;