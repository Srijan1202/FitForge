import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, XStack, YStack, useTheme } from 'tamagui';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/useUserStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useNutritionStore } from '../../store/useNutritionStore';
import { getDb } from '../../db/sqlite';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Clock, Play, Sparkles, Calendar, Shield, Clipboard, CheckCircle2 } from 'lucide-react-native';

export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const operatorName = useUserStore((state) => state.name);
  const dailyCaloriesTarget = useUserStore((state) => state.daily_calories);
  
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const startSession = useWorkoutStore((state) => state.startSession);

  const fetchLogs = useNutritionStore((state) => state.fetchDailyLogs);
  const logs = useNutritionStore((state) => state.logs);

  const [todayDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  });

  const [todayExercises, setTodayExercises] = useState<{
    id: string;
    name: string;
    target_muscle: string;
    target_sets: number;
    target_reps: string;
  }[]>([]);
  const [activeRoutineName, setActiveRoutineName] = useState<string | null>(null);

  // Focus effect to ensure dashboards are fresh
  const loadTodaySchedule = async () => {
    try {
      const db = getDb();
      
      // Determine calendar day (1 = Monday, 7 = Sunday)
      const calendarDay = new Date().getDay();
      const todayDayNum = calendarDay === 0 ? 7 : calendarDay;

      // 1. Get active routine
      const rRow = await db.getFirstAsync(
        'SELECT id, routine_name FROM routines WHERE is_active = 1 LIMIT 1'
      ) as { id: string; routine_name: string } | null;
      
      if (rRow) {
        setActiveRoutineName(rRow.routine_name);
        
        // 2. Fetch exercises for today's split day
        const rows = await db.getAllAsync(`
          SELECT 
            re.exercise_id as id,
            el.name,
            el.target_muscle,
            re.target_sets,
            re.target_reps
          FROM routine_exercises re
          JOIN exercise_library el ON re.exercise_id = el.id
          WHERE re.routine_id = ? AND re.day_of_week = ?
          ORDER BY re.order_index ASC
        `, [rRow.id, todayDayNum]) as { id: string; name: string; target_muscle: string; target_sets: number; target_reps: string }[];
        
        setTodayExercises(rows);
      } else {
        setActiveRoutineName(null);
        setTodayExercises([]);
      }
    } catch (err) {
      console.error('[HomeScreen] SQLite load today schedule error:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs(todayDate);
      loadTodaySchedule();
    }, [todayDate])
  );

  // Compute daily telemetry
  const consumedCals = logs.reduce((acc, curr) => acc + curr.calories, 0);
  const calRemaining = dailyCaloriesTarget - consumedCals;
  const isCalsOverload = consumedCals > dailyCaloriesTarget;
  const calPercent = Math.min(100, (consumedCals / dailyCaloriesTarget) * 100);

  // Quick launch empty workout
  const handleStartFreestyle = () => {
    startSession();
    navigation.navigate('Log');
  };

  return (
    <View flex={1} bg="$background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 80 }}>
        
        {/* Profile Telemetry Greeting */}
        <XStack jc="space-between" ai="center" mb="$4" mt="$4">
          <YStack>
            <Text color="$textSecondary" fontSize="$1" fontFamily="$mono">OPERATOR ONLINE</Text>
            <Text color="$color" fontSize="$5" fontFamily="$heading">
              GREETINGS, {operatorName.toUpperCase() || 'AGENT'}
            </Text>
          </YStack>
          <View bg="$bgSurface" p="$2" br="$2" borderWidth={1} borderColor="$borderHairline">
            <Shield size={16} color={theme.accentPrimary.get() as string} />
          </View>
        </XStack>

        {/* Dynamic Widget 1: Active Session HUD Card */}
        {activeSession && (
          <Card 
            mb="$4" 
            p="$3"
            br="$3"
            borderWidth={1}
            borderColor="$accentPrimary"
            bg="$bgSurface"
            shadowColor="$accentGlow"
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={1}
            shadowRadius={15}
          >
            <XStack jc="space-between" ai="center">
              <YStack gap="$1" flex={2}>
                <XStack ai="center" gap="$1.5">
                  <View w={8} h={8} br={99} bg="$accentPrimary" />
                  <Text color="$accentPrimary" fontFamily="$heading" fontSize="$2" fontWeight="bold">
                    ACTIVE LOG MONITORING
                  </Text>
                </XStack>
                <Text color="$textPrimary" fontFamily="$mono" fontSize="$1">
                  WORKOUT SESSION RUNNING IN BACKGROUND
                </Text>
              </YStack>
              <Button 
                title="RESUME LOG" 
                variant="primary" 
                onPress={() => navigation.navigate('Log')} 
              />
            </XStack>
          </Card>
        )}

        {/* Dynamic Widget 2: Calorie Progress HUD */}
        <Card mb="$4" raised>
          <XStack jc="space-between" ai="center" mb="$2">
            <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CALORIE SPEC BUDGET</Text>
            <Sparkles size={12} color={theme.accentPrimary.get() as string} />
          </XStack>
          
          <YStack gap="$2" ai="center" py="$2">
            <XStack ai="flex-end" gap="$1.5">
              <Text 
                color={isCalsOverload ? '$stateWarning' : '$textPrimary'} 
                fontFamily="$heading" 
                fontSize="$4" 
                fontWeight="bold"
              >
                {consumedCals}
              </Text>
              <Text color="$textSecondary" fontFamily="$body" fontSize="$1" mb="$1">
                / {dailyCaloriesTarget} KCAL
              </Text>
            </XStack>

            <View w="100%" h={8} bg="$bgBase" br="$1" borderWidth={1} borderColor="$borderHairline" overflow="hidden">
              <View 
                h="100%" 
                bg={isCalsOverload ? '$stateWarning' : '$accentPrimary'} 
                w={`${calPercent}%`}
                shadowColor={isCalsOverload ? '$stateWarning' : '$accentGlow'}
                shadowRadius={6}
                shadowOpacity={1}
              />
            </View>

            <Text color="$textSecondary" fontSize="$1" fontFamily="$mono" mt="$1">
              {isCalsOverload 
                ? `ENERGY OVERALL DELTA: +${Math.abs(calRemaining)} KCAL` 
                : `${calRemaining} KCAL REMAINING TODAY`}
            </Text>
          </YStack>
        </Card>

        {/* Dynamic Widget 3: Today's Schedule lifts */}
        <Text color="$textSecondary" fontSize="$1" fontFamily="$body" mb="$2">TODAY'S TRAINING SPLIT DIRECTIVE</Text>

        {todayExercises.length > 0 ? (
          <YStack gap="$3">
            
            {/* Header specifying scheduled routine day */}
            <Card bg="$bgSurfaceRaised" p="$3" br="$3" borderWidth={1} borderColor="$accentPrimary" borderStyle="dashed">
              <XStack jc="space-between" ai="center">
                <YStack>
                  <Text color="$accentPrimary" fontFamily="$heading" fontSize="$3">
                    {activeRoutineName?.toUpperCase() || 'SCHEDULED ROUTINE'}
                  </Text>
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
                    ACTIVE CALENDAR DIRECTIVE FOR TODAY
                  </Text>
                </YStack>
                <Clipboard size={16} color={theme.accentPrimary.get() as string} />
              </XStack>
            </Card>

            {/* List of Lifts */}
            {todayExercises.map((ex) => (
              <Card key={ex.id} p="$3" br="$2" bg="$bgSurface" borderWidth={1} borderColor="$borderHairline">
                <XStack jc="space-between" ai="center">
                  <YStack>
                    <Text color="$textPrimary" fontFamily="$body" fontSize="$2" fontWeight="bold">
                      {ex.name}
                    </Text>
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
                      {ex.target_muscle.toUpperCase()}
                    </Text>
                  </YStack>
                  <XStack ai="center" gap="$1">
                    <Text color="$accentPrimary" fontFamily="$mono" fontSize="$2" fontWeight="bold">
                      {ex.target_sets}
                    </Text>
                    <Text color="$textSecondary" fontFamily="$mono" fontSize="$1">sets</Text>
                    <Text color="$textSecondary" fontFamily="$mono" fontSize="$1" mx="$1">x</Text>
                    <Text color="$textPrimary" fontFamily="$mono" fontSize="$2">
                      {ex.target_reps}
                    </Text>
                  </XStack>
                </XStack>
              </Card>
            ))}

            {/* Launch session shortcut */}
            <Button title="BOOT TRAINING LOG SCREEN" onPress={() => navigation.navigate('Log')} />

          </YStack>
        ) : (
          /* Rest Day Recovery Layout */
          <Card borderStyle="dashed" ai="center" jc="center" py="$6" px="$4">
            <View mb="$2">
              <Calendar size={24} color={theme.textDisabled.get() as string} />
            </View>
            <CardTitle mb="$1">REST CYCLE SYSTEM ACTIVE</CardTitle>
            <CardSubtitle mb="$4" textAlign="center">
              No lifts pre-calibrated for today. Calibrate recover buffers or start a freestyle session.
            </CardSubtitle>
            
            <YStack gap="$3" w="100%">
              <Button title="BOOT FREESTYLE LOG PROTOCOL" onPress={handleStartFreestyle} />
              <Button title="MANAGE ROUTINES PROTOCOLS" variant="secondary" onPress={() => navigation.navigate('Routines')} />
            </YStack>
          </Card>
        )}

      </ScrollView>
    </View>
  );
};
