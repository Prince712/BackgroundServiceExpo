import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BackgroundServiceState {
  isEnabled: boolean;
  interval: number; // in minutes
  lastTriggered: number | null;
}

const initialState: BackgroundServiceState = {
  isEnabled: false,
  interval: 2, // default 2 minutes
  lastTriggered: null,
};

const backgroundServiceSlice = createSlice({
  name: 'backgroundService',
  initialState,
  reducers: {
    toggleService: (state) => {
      state.isEnabled = !state.isEnabled;
    },
    setAlertInterval: (state, action: PayloadAction<number>) => {
      state.interval = action.payload;
    },
    updateLastTriggered: (state) => {
      state.lastTriggered = Date.now();
    },
  },
});

export const { toggleService, setAlertInterval, updateLastTriggered } = backgroundServiceSlice.actions;
export default backgroundServiceSlice.reducer;