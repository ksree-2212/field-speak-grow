import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  recognition: any | null;
  synthesis: SpeechSynthesis | null;
  currentVoice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
}

const initialState: VoiceState = {
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  transcript: '',
  error: null,
  isSupported: false,
  recognition: null,
  synthesis: null,
  currentVoice: null,
  volume: 0.8,
  rate: 1.0,
  pitch: 1.0,
};

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    setSupported: (state, action: PayloadAction<boolean>) => {
      state.isSupported = action.payload;
    },
    setRecognition: (state, action: PayloadAction<any | null>) => {
      state.recognition = action.payload;
    },
    setSynthesis: (state, action: PayloadAction<SpeechSynthesis | null>) => {
      state.synthesis = action.payload;
    },
    startListening: (state) => {
      state.isListening = true;
      state.error = null;
      state.transcript = '';
    },
    stopListening: (state) => {
      state.isListening = false;
    },
    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload;
    },
    startSpeaking: (state) => {
      state.isSpeaking = true;
    },
    stopSpeaking: (state) => {
      state.isSpeaking = false;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentVoice: (state, action: PayloadAction<SpeechSynthesisVoice | null>) => {
      state.currentVoice = action.payload;
    },
    setVoiceSettings: (state, action: PayloadAction<{ volume?: number; rate?: number; pitch?: number }>) => {
      const { volume, rate, pitch } = action.payload;
      if (volume !== undefined) state.volume = volume;
      if (rate !== undefined) state.rate = rate;
      if (pitch !== undefined) state.pitch = pitch;
    },
  },
});

export const {
  setSupported,
  setRecognition,
  setSynthesis,
  startListening,
  stopListening,
  setTranscript,
  startSpeaking,
  stopSpeaking,
  setProcessing,
  setError,
  setCurrentVoice,
  setVoiceSettings,
} = voiceSlice.actions;

export default voiceSlice.reducer;