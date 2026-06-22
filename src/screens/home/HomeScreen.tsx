import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, XStack, YStack, useTheme, Input, styled } from 'tamagui';
import { Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/useUserStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useNutritionStore } from '../../store/useNutritionStore';
import { getDb } from '../../db/sqlite';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Clock, Play, Sparkles, Calendar, Shield, Clipboard, CheckCircle2 } from 'lucide-react-native';

const HUDInput = styled(Input, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$2',
  color: '$textPrimary',
  fontFamily: '$mono',
  fontSize: '$2',
  paddingHorizontal: '$3',
  height: 40,
  
  focusStyle: {
    borderColor: '$accentPrimary',
    borderWidth: 1,
  },
});

export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const operatorName = useUserStore((state) => state.name);
  const dailyCaloriesTarget = useUserStore((state) => state.daily_calories);
  const signOut = useUserStore((state) => state.signOut);
  const userStore = useUserStore();
  const saveProfile = useUserStore((state) => state.saveProfile);

  // Profile Editor Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editGoal, setEditGoal] = useState<any>('general');
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFats, setEditFats] = useState('');
  const [editHostel, setEditHostel] = useState('1');
  const [editMess, setEditMess] = useState('1');
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEditProfile = () => {
    setEditName(userStore.name || '');
    setEditAge(userStore.age ? userStore.age.toString() : '');
    setEditWeight(userStore.weight_kg ? userStore.weight_kg.toString() : '');
    setEditHeight(userStore.height_cm ? userStore.height_cm.toString() : '');
    setEditGoal(userStore.fitness_goal || 'general');
    setEditCalories(userStore.daily_calories.toString());
    setEditProtein(userStore.daily_protein_g.toString());
    setEditCarbs(userStore.daily_carbs_g.toString());
    setEditFats(userStore.daily_fats_g.toString());
    setEditHostel(userStore.hostel || '1');
    setEditMess(userStore.mess || '1');
    setEditError(null);
    setIsEditProfileOpen(true);
  };

  const handleAutoCalibrate = () => {
    const w = parseFloat(editWeight);
    const h = parseFloat(editHeight);
    const a = parseInt(editAge, 10);
    
    if (!isNaN(w) && !isNaN(h) && !isNaN(a)) {
      const bmr = 10 * w + 6.25 * h - 5 * a - 78;
      const tdee = Math.round(bmr * 1.375);
      
      let targetCalories = tdee;
      if (editGoal === 'bulk') targetCalories += 500;
      else if (editGoal === 'cut') targetCalories -= 500;
      targetCalories = Math.max(1200, targetCalories);

      const targetProtein = Math.round(w * 2.0);
      const proteinKcal = targetProtein * 4;
      const targetFats = Math.round((targetCalories * 0.25) / 9);
      const fatsKcal = targetFats * 9;
      const targetCarbs = Math.max(50, Math.round((targetCalories - proteinKcal - fatsKcal) / 4));
      const actualCalories = (targetProtein * 4) + (targetCarbs * 4) + (targetFats * 9);

      setEditCalories(actualCalories.toString());
      setEditProtein(targetProtein.toString());
      setEditCarbs(targetCarbs.toString());
      setEditFats(targetFats.toString());
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editAge || !editWeight || !editHeight || !editCalories || !editProtein || !editCarbs || !editFats) {
      setEditError('Please fill out all fields.');
      return;
    }

    const a = parseInt(editAge, 10);
    const w = parseFloat(editWeight);
    const h = parseFloat(editHeight);
    const cal = parseInt(editCalories, 10);
    const prot = parseInt(editProtein, 10);
    const carb = parseInt(editCarbs, 10);
    const fat = parseInt(editFats, 10);

    if (isNaN(a) || a <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setEditError('Invalid biometrics values.');
      return;
    }
    if (isNaN(cal) || cal < 800 || isNaN(prot) || prot < 0 || isNaN(carb) || carb < 0 || isNaN(fat) || fat < 0) {
      setEditError('Min 800 kcal required, macros must be positive.');
      return;
    }

    setEditError(null);

    try {
      await saveProfile({
        name: editName.trim(),
        age: a,
        weight_kg: w,
        height_cm: h,
        fitness_goal: editGoal,
        daily_calories: cal,
        daily_protein_g: prot,
        daily_carbs_g: carb,
        daily_fats_g: fat,
        hostel: editHostel,
        mess: editMess,
      });
      setIsEditProfileOpen(false);
    } catch (err: any) {
      setEditError('Profile save failed: ' + err.toString());
    }
  };
  
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
          <YStack flex={1}>
            <Text color="$textSecondary" fontSize="$1" fontFamily="$mono">OPERATOR ONLINE</Text>
            <Text color="$color" fontSize="$5" fontFamily="$heading" numberOfLines={1}>
              GREETINGS, {operatorName.toUpperCase() || 'AGENT'}
            </Text>
          </YStack>
          <XStack ai="center" gap="$2">
            <Button
              title="EDIT PROFILE"
              variant="secondary"
              onPress={handleOpenEditProfile}
              paddingVertical="$1.5"
              paddingHorizontal="$3"
              height={36}
            />
            <Button
              title="LOG OUT"
              variant="secondary"
              onPress={signOut}
              paddingVertical="$1.5"
              paddingHorizontal="$3"
              height={36}
            />
            <View bg="$bgSurface" p="$2" br="$2" borderWidth={1} borderColor="$borderHairline">
              <Shield size={16} color={theme.accentPrimary.get() as string} />
            </View>
          </XStack>
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

      {isEditProfileOpen && (
        <View position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(10,14,12,0.92)" zi={1000} p="$4" jc="center">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
            <YStack bg="$bgSurface" br="$3" p="$4" borderWidth={1} borderColor="$borderHairline" maxH="90%" gap="$4">
              <XStack jc="space-between" ai="center">
                <Text color="$accentPrimary" fontFamily="$heading" fontSize="$3">CALIBRATE PROFILE</Text>
                <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                  <Text color="$stateError" fontFamily="$mono" fontSize="$2">ABORT</Text>
                </TouchableOpacity>
              </XStack>

              <ScrollView flex={1} contentContainerStyle={{ gap: 16 }} keyboardShouldPersistTaps="handled">
                <YStack gap="$1">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FULL NAME</Text>
                  <HUDInput placeholder="Enter your name" value={editName} onChangeText={setEditName} />
                </YStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">AGE</Text>
                    <HUDInput placeholder="e.g. 21" value={editAge} onChangeText={setEditAge} keyboardType="numeric" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">WEIGHT (KG)</Text>
                    <HUDInput placeholder="e.g. 75" value={editWeight} onChangeText={setEditWeight} keyboardType="numeric" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">HEIGHT (CM)</Text>
                    <HUDInput placeholder="e.g. 175" value={editHeight} onChangeText={setEditHeight} keyboardType="numeric" />
                  </YStack>
                </XStack>

                {/* Fitness Goal Selection */}
                <YStack gap="$1.5">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FITNESS GOAL</Text>
                  <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline" gap="$1">
                    {['general', 'cut', 'bulk', 'maintain'].map((g) => (
                      <TouchableOpacity key={g} onPress={() => setEditGoal(g)} style={{ flex: 1 }}>
                        <View py="$2" ai="center" br="$1" bg={editGoal === g ? '$bgSurfaceRaised' : 'transparent'}>
                          <Text fontFamily="$heading" fontSize="$1" color={editGoal === g ? '$accentPrimary' : '$textSecondary'}>
                            {g.toUpperCase()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </XStack>
                </YStack>

                <Button title="AUTO CALIBRATE MACROS" variant="secondary" onPress={handleAutoCalibrate} />

                {/* Calorie & Macro Targets */}
                <XStack gap="$3">
                  <YStack flex={1.2} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CALORIE TARGET (KCAL)</Text>
                    <HUDInput placeholder="2000" value={editCalories} onChangeText={setEditCalories} keyboardType="numeric" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">PROTEIN (G)</Text>
                    <HUDInput placeholder="150" value={editProtein} onChangeText={setEditProtein} keyboardType="numeric" />
                  </YStack>
                </XStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CARBS (G)</Text>
                    <HUDInput placeholder="200" value={editCarbs} onChangeText={setEditCarbs} keyboardType="numeric" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FATS (G)</Text>
                    <HUDInput placeholder="65" value={editFats} onChangeText={setEditFats} keyboardType="numeric" />
                  </YStack>
                </XStack>

                {/* Default Hostel / Mess select */}
                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">DEFAULT HOSTEL</Text>
                    <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline">
                      {['1', '2'].map((hNum) => (
                        <TouchableOpacity key={hNum} onPress={() => setEditHostel(hNum)} style={{ flex: 1 }}>
                          <View py="$2" ai="center" br="$1" bg={editHostel === hNum ? '$bgSurfaceRaised' : 'transparent'}>
                            <Text fontFamily="$heading" fontSize="$1" color={editHostel === hNum ? '$accentPrimary' : '$textSecondary'}>HOSTEL {hNum}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </XStack>
                  </YStack>

                  <YStack flex={1.5} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">DEFAULT MESS</Text>
                    <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline">
                      {['1', '2', '3'].map((mNum) => (
                        <TouchableOpacity key={mNum} onPress={() => setEditMess(mNum)} style={{ flex: 1 }}>
                          <View py="$2" ai="center" br="$1" bg={editMess === mNum ? '$bgSurfaceRaised' : 'transparent'}>
                            <Text fontFamily="$heading" fontSize="$1" color={editMess === mNum ? '$accentPrimary' : '$textSecondary'}>MESS {mNum}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </XStack>
                  </YStack>
                </XStack>

                {editError && (
                  <View bg="$bgSurface" borderColor="$stateError" borderWidth={1} br="$2" p="$2.5">
                    <Text color="$stateError" fontFamily="$mono" fontSize="$1">
                      CALIBRATION FAULT: {editError.toUpperCase()}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <Button title="SAVE PROFILE CALIBRATION" onPress={handleSaveProfile} />
            </YStack>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
};
