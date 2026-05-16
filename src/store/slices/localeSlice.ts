import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface for locale state
interface LocaleState {
  current: string; // Current language: 'ar' or 'en'
}

// Default locale matches routing defaultLocale
const initialState: LocaleState = {
  current: 'ar',
};

// Locale slice to manage language state in Redux
// This allows baseQuery to read the current language and send Accept-Language header
const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    // Action to set/change locale - called from Navbar and Providers
    setLocale: (state, action: PayloadAction<string>) => {
      state.current = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
