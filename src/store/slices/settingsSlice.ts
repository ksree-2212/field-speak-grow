import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  voiceEnabled: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    weather: boolean;
    market: boolean;
    guidance: boolean;
  };
  location: {
    lat: number | null;
    lng: number | null;
    name: string;
  };
  units: {
    temperature: 'celsius' | 'fahrenheit';
    area: 'acres' | 'hectares';
    weight: 'kg' | 'pounds';
  };
  offlineMode: boolean;
  dataSync: boolean;
}

const initialState: SettingsState = {
  language: 'en',
  theme: 'light',
  voiceEnabled: true,
  highContrast: false,
  fontSize: 'medium',
  notifications: {
    weather: true,
    market: true,
    guidance: true,
  },
  location: {
    lat: null,
    lng: null,
    name: '',
  },
  units: {
    temperature: 'celsius',
    area: 'acres',
    weight: 'kg',
  },
  offlineMode: false,
  dataSync: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setVoiceEnabled: (state, action: PayloadAction<boolean>) => {
      state.voiceEnabled = action.payload;
    },
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.highContrast = action.payload;
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Partial<typeof initialState.notifications>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setLocation: (state, action: PayloadAction<typeof initialState.location>) => {
      state.location = action.payload;
    },
    setUnits: (state, action: PayloadAction<Partial<typeof initialState.units>>) => {
      state.units = { ...state.units, ...action.payload };
    },
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.offlineMode = action.payload;
    },
    setDataSync: (state, action: PayloadAction<boolean>) => {
      state.dataSync = action.payload;
    },
  },
});

export const {
  setLanguage,
  setTheme,
  setVoiceEnabled,
  setHighContrast,
  setFontSize,
  setNotifications,
  setLocation,
  setUnits,
  setOfflineMode,
  setDataSync,
} = settingsSlice.actions;

export default settingsSlice.reducer;