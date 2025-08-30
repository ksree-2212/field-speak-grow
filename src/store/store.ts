import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import soilSlice from './slices/soilSlice';
import cropSlice from './slices/cropSlice';
import marketSlice from './slices/marketSlice';
import voiceSlice from './slices/voiceSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    soil: soilSlice,
    crops: cropSlice,
    market: marketSlice,
    voice: voiceSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['voice/setRecognition', 'voice/setSynthesis'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;