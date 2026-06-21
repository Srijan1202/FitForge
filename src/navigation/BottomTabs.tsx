import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, List, Play, BarChart2, Apple } from 'lucide-react-native';
import { useTheme } from 'tamagui';

import { HomeScreen } from '../screens/home/HomeScreen';
import { RoutinesScreen } from '../screens/routines/RoutinesScreen';
import { WorkoutScreen } from '../screens/workout-session/WorkoutScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { NutritionScreen } from '../screens/nutrition/NutritionScreen';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bgSurface.get(),
          borderTopColor: theme.borderHairline.get(),
        },
        tabBarActiveTintColor: theme.accentPrimary.get(),
        tabBarInactiveTintColor: theme.textSecondary.get(),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Routines"
        component={RoutinesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Log"
        component={WorkoutScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Play color={theme.accentPrimary.get()} size={size + 8} />
          ),
          tabBarLabelStyle: { color: theme.accentPrimary.get(), fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
