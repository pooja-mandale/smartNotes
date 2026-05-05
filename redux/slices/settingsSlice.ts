import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  darkMode: boolean;
  dailyReminders: boolean;
  themeColor: string;
}

const initialState: SettingsState = {
  darkMode: false,
  dailyReminders: true,
  themeColor: '#6366F1', // Indigo Premium
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setDailyReminders: (state, action: PayloadAction<boolean>) => {
      state.dailyReminders = action.payload;
    },
    setThemeColor: (state, action: PayloadAction<string>) => {
      state.themeColor = action.payload;
    },
  },
});

export const { setDarkMode, setDailyReminders, setThemeColor } = settingsSlice.actions;
export default settingsSlice.reducer;
