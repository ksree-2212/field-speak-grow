import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CropSuggestion {
  id: string;
  name: string;
  scientificName: string;
  icon: string;
  expectedYield: number;
  expectedProfit: number;
  waterRequirement: 'low' | 'medium' | 'high';
  soilSuitability: number;
  marketDemand: 'low' | 'medium' | 'high';
  sustainabilityRating: number;
  growthPeriod: number;
  bestSeasonStart: string;
  bestSeasonEnd: string;
  tips: string[];
}

export interface UserCrop {
  id: string;
  cropId: string;
  fieldName: string;
  plantingDate: string;
  expectedHarvest: string;
  area: number;
  currentStage: string;
  health: 'excellent' | 'good' | 'moderate' | 'poor';
  notes: string[];
}

interface CropState {
  suggestions: CropSuggestion[];
  userCrops: UserCrop[];
  filteredSuggestions: CropSuggestion[];
  activeFilters: {
    profit: boolean;
    waterUsage: boolean;
    soilMatch: boolean;
    season: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: CropState = {
  suggestions: [],
  userCrops: [],
  filteredSuggestions: [],
  activeFilters: {
    profit: false,
    waterUsage: false,
    soilMatch: false,
    season: false,
  },
  isLoading: false,
  error: null,
};

const cropSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    setSuggestions: (state, action: PayloadAction<CropSuggestion[]>) => {
      state.suggestions = action.payload;
      state.filteredSuggestions = action.payload;
    },
    addUserCrop: (state, action: PayloadAction<UserCrop>) => {
      state.userCrops.push(action.payload);
    },
    updateUserCrop: (state, action: PayloadAction<UserCrop>) => {
      const index = state.userCrops.findIndex(crop => crop.id === action.payload.id);
      if (index !== -1) {
        state.userCrops[index] = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.activeFilters>>) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    applyFilters: (state) => {
      let filtered = [...state.suggestions];
      
      if (state.activeFilters.profit) {
        filtered = filtered.sort((a, b) => b.expectedProfit - a.expectedProfit);
      }
      
      if (state.activeFilters.waterUsage) {
        filtered = filtered.filter(crop => crop.waterRequirement === 'low');
      }
      
      if (state.activeFilters.soilMatch) {
        filtered = filtered.filter(crop => crop.soilSuitability >= 8);
      }
      
      state.filteredSuggestions = filtered;
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
  setSuggestions,
  addUserCrop,
  updateUserCrop,
  setFilters,
  applyFilters,
  setLoading,
  setError,
} = cropSlice.actions;

export default cropSlice.reducer;