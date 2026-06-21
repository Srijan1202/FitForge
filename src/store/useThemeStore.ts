import { create } from 'zustand';

type ThemeState = {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark', // Default to HUD dark mode
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),
}));
