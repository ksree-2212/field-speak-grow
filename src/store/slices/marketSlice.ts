import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MarketPrice {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  market: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface PriceHistory {
  date: string;
  price: number;
}

interface MarketState {
  prices: MarketPrice[];
  priceHistory: { [cropId: string]: PriceHistory[] };
  nearbyMarkets: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: MarketState = {
  prices: [],
  priceHistory: {},
  nearbyMarkets: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPrices: (state, action: PayloadAction<MarketPrice[]>) => {
      state.prices = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updatePrice: (state, action: PayloadAction<MarketPrice>) => {
      const index = state.prices.findIndex(price => price.id === action.payload.id);
      if (index !== -1) {
        state.prices[index] = action.payload;
      } else {
        state.prices.push(action.payload);
      }
    },
    setPriceHistory: (state, action: PayloadAction<{ cropId: string; history: PriceHistory[] }>) => {
      state.priceHistory[action.payload.cropId] = action.payload.history;
    },
    setNearbyMarkets: (state, action: PayloadAction<string[]>) => {
      state.nearbyMarkets = action.payload;
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
  setPrices,
  updatePrice,
  setPriceHistory,
  setNearbyMarkets,
  setLoading,
  setError,
} = marketSlice.actions;

export default marketSlice.reducer;