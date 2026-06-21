import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import tamaguiConfig from './tamagui.config';
import { useThemeStore } from './src/store/useThemeStore';
import { useUserStore } from './src/store/useUserStore';
import { RootNavigator } from './src/navigation';
import { initDb } from './src/db/sqlite';
import { supabase } from './src/api/supabase';

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  const { theme } = useThemeStore();
  const setSession = useUserStore((state) => state.setSession);
  const setLoading = useUserStore((state) => state.setLoading);
  const loading = useUserStore((state) => state.loading);

  useEffect(() => {
    // 1. Initialize SQLite Database for offline-first logging
    initDb()
      .then(() => console.log('SQLite database initialized.'))
      .catch((err) => console.error('Failed to initialize SQLite database:', err));

    // 2. Load initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 3. Track auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);

  if (!loaded || loading) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <Theme name={theme}>
        <RootNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </Theme>
    </TamaguiProvider>
  );
}
