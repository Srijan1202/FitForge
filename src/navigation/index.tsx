import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'tamagui';

import { useUserStore } from '../store/useUserStore';
import { BottomTabs } from './BottomTabs';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const session = useUserStore((state) => state.session);
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  const theme = useTheme();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.bgBase.get() as string,
      card: theme.bgSurface.get() as string,
      text: theme.textPrimary.get() as string,
      border: theme.borderHairline.get() as string,
      primary: theme.accentPrimary.get() as string,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={BottomTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
