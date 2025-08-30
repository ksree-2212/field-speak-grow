import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SoilData {
  id: string;
  fieldName: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  organicMatter: number;
  temperature: number;
  lastUpdated: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SoilHealthScore {
  overall: number;
  ph: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  nutrients: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  moisture: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
}

interface SoilState {
  soilData: SoilData[];
  currentSoil: SoilData | null;
  healthScore: SoilHealthScore | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SoilState = {
  soilData: [],
  currentSoil: null,
  healthScore: null,
  isLoading: false,
  error: null,
};

const soilSlice = createSlice({
  name: 'soil',
  initialState,
  reducers: {
    addSoilData: (state, action: PayloadAction<SoilData>) => {
      state.soilData.push(action.payload);
      state.currentSoil = action.payload;
    },
    updateSoilData: (state, action: PayloadAction<SoilData>) => {
      const index = state.soilData.findIndex(soil => soil.id === action.payload.id);
      if (index !== -1) {
        state.soilData[index] = action.payload;
        if (state.currentSoil?.id === action.payload.id) {
          state.currentSoil = action.payload;
        }
      }
    },
    setCurrentSoil: (state, action: PayloadAction<SoilData | null>) => {
      state.currentSoil = action.payload;
    },
    setSoilHealthScore: (state, action: PayloadAction<SoilHealthScore>) => {
      state.healthScore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addSoilData,
  updateSoilData,
  setCurrentSoil,
  setSoilHealthScore,
  setLoading,
  setError,
} = soilSlice.actions;

export default soilSlice.reducer;