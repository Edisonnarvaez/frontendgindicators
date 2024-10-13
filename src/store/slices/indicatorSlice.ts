import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Indicator {
  id: number;
  name: string;
  value: number;
}

interface IndicatorState {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
}

const initialState: IndicatorState = {
  indicators: [],
  loading: false,
  error: null,
};

const indicatorSlice = createSlice({
  name: 'indicators',
  initialState,
  reducers: {
    setIndicators: (state, action: PayloadAction<Indicator[]>) => {
      state.indicators = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setIndicators, setLoading, setError } = indicatorSlice.actions;
export default indicatorSlice.reducer;