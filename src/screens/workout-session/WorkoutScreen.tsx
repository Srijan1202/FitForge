import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, XStack, YStack, styled, useTheme, Input } from 'tamagui';
import { LiveSetCard } from '../../components/ui/LiveSetCard';
import { Button } from '../../components/ui/Button';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { useWorkoutStore, WorkoutLog } from '../../store/useWorkoutStore';
import { getDb } from '../../db/sqlite';
import { useNavigation } from '@react-navigation/native';
import { Play, Square, Plus, Search, Trash2, Clock, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { Alert, TouchableOpacity } from 'react-native';

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

interface ExerciseLibItem {
  id: string;
  name: string;
  target_muscle: string;
  equipment: string;
}

interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  day_of_week: number;
  order_index: number;
  target_sets: number;
  target_reps: string;
  exercise_name: string;
  target_muscle: string;
  equipment: string;
}

interface SessionExercise {
  id: string;
  name: string;
  target_muscle: string;
  equipment: string;
  sets: {
    weight: string;
    reps: string;
    isLogged: boolean;
  }[];
}

export const WorkoutScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const activeSession = useWorkoutStore((state) => state.activeSession);
  const startSession = useWorkoutStore((state) => state.startSession);
  const logSet = useWorkoutStore((state) => state.logSet);
  const removeSet = useWorkoutStore((state) => state.removeSet);
  const finishSession = useWorkoutStore((state) => state.finishSession);
  const clearSession = () => useWorkoutStore.setState({ activeSession: null });

  // Timers State
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [restSeconds, setRestSeconds] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [restMax, setRestMax] = useState(90);

  // Exercises State
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [routineDays, setRoutineDays] = useState<number[]>([]);
  const [routineName, setRoutineName] = useState('FREESTYLE SESSION');

  // Modal Library Search State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibItem[]>([]);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseMuscle, setCustomExerciseMuscle] = useState('Chest');

  // Elapsed Session Ticker
  useEffect(() => {
    if (!activeSession) return;
    
    // Ticker logic
    const updateTicker = () => {
      const start = new Date(activeSession.started_at).getTime();
      const now = new Date().getTime();
      const diffSecs = Math.floor((now - start) / 1000);
      
      const hrs = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      
      const formatted = hrs > 0 
        ? `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      setElapsedTime(formatted);
    };

    updateTicker();
    const ticker = setInterval(updateTicker, 1000);
    
    return () => clearInterval(ticker);
  }, [activeSession?.started_at]);

  // Rest Timer Ticker
  useEffect(() => {
    let interval: any = null;
    if (restActive && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds <= 0 && restActive) {
      setRestActive(false);
    }
    return () => clearInterval(interval);
  }, [restActive, restSeconds]);

  // Load routine details & exercises if routineId is set
  useEffect(() => {
    const loadRoutineDetails = async () => {
      if (!activeSession) return;
      
      if (!activeSession.routine_id) {
        setRoutineName('FREESTYLE WORKOUT');
        setRoutineDays([]);
        setSessionExercises([]);
        return;
      }

      try {
        const db = getDb();
        
        // 1. Get Routine Name
        const rRow = await db.getFirstAsync(
          'SELECT routine_name FROM routines WHERE id = ?',
          [activeSession.routine_id]
        ) as { routine_name: string } | null;
        if (rRow) setRoutineName(rRow.routine_name);

        // 2. Fetch Exercises for the active routine
        const rows = await db.getAllAsync(`
          SELECT 
            re.id,
            re.routine_id,
            re.exercise_id,
            re.day_of_week,
            re.order_index,
            re.target_sets,
            re.target_reps,
            el.name as exercise_name,
            el.target_muscle,
            el.equipment
          FROM routine_exercises re
          JOIN exercise_library el ON re.exercise_id = el.id
          WHERE re.routine_id = ?
          ORDER BY re.day_of_week ASC, re.order_index ASC
        `, [activeSession.routine_id]) as RoutineExercise[];

        // Extract days
        const days = Array.from(new Set(rows.map(r => r.day_of_week))).sort((a, b) => a - b);
        setRoutineDays(days);
        
        let targetDay = selectedDay;
        if (days.length > 0 && !days.includes(selectedDay)) {
          targetDay = days[0];
          setSelectedDay(days[0]);
        }

        // Filter exercises for selected day
        const dayRows = rows.filter(r => r.day_of_week === targetDay);

        const mapped = dayRows.map(r => {
          // Retrieve previously completed log sets in the active session if they exist
          const exLogs = activeSession.logs.filter(l => l.exercise_id === r.exercise_id);
          
          const sets = Array.from({ length: r.target_sets }).map((_, idx) => {
            const setNo = idx + 1;
            const log = exLogs.find(l => l.set_number === setNo);
            return {
              weight: log ? log.weight_lifted.toString() : '',
              reps: log ? log.reps.toString() : '',
              isLogged: !!log,
            };
          });

          return {
            id: r.exercise_id,
            name: r.exercise_name,
            target_muscle: r.target_muscle,
            equipment: r.equipment,
            sets,
          };
        });

        setSessionExercises(mapped);
      } catch (err) {
        console.error('[WorkoutScreen] Failed to load routine exercises:', err);
      }
    };
    loadRoutineDetails();
  }, [activeSession?.routine_id, selectedDay]);

  // Load Exercise Library popover list
  const loadExerciseLibrary = async () => {
    try {
      const db = getDb();
      const rows = await db.getAllAsync(
        'SELECT * FROM exercise_library ORDER BY name ASC'
      ) as ExerciseLibItem[];
      setExerciseLibrary(rows);
    } catch (err) {
      console.error('[WorkoutScreen] Failed to load exercise library:', err);
    }
  };

  useEffect(() => {
    if (isAddModalOpen) {
      loadExerciseLibrary();
    }
  }, [isAddModalOpen]);

  // Log Set Toggle
  const handleToggleSet = (exId: string, setIdx: number) => {
    const ex = sessionExercises.find((e) => e.id === exId);
    if (!ex) return;

    const setObj = ex.sets[setIdx];
    const setNo = setIdx + 1;

    if (setObj.isLogged) {
      // Unlog set
      removeSet(exId, setNo);
      setSessionExercises(prev => prev.map(e => {
        if (e.id === exId) {
          const newSets = [...e.sets];
          newSets[setIdx] = { ...newSets[setIdx], isLogged: false };
          return { ...e, sets: newSets };
        }
        return e;
      }));
    } else {
      // Log set (validate input values)
      const w = parseFloat(setObj.weight);
      const r = parseInt(setObj.reps, 10);

      if (isNaN(w) || w < 0 || isNaN(r) || r <= 0) {
        Alert.alert('Metrics Error', 'Please enter valid weight and rep counts.');
        return;
      }

      logSet({
        exercise_id: exId,
        set_number: setNo,
        weight_lifted: w,
        reps: r,
      });

      setSessionExercises(prev => prev.map(e => {
        if (e.id === exId) {
          const newSets = [...e.sets];
          newSets[setIdx] = { ...newSets[setIdx], isLogged: true };
          return { ...e, sets: newSets };
        }
        return e;
      }));

      // Trigger Rest timer countdown
      setRestSeconds(restMax);
      setRestActive(true);
    }
  };

  // Mutate set input values locally
  const handleChangeSetInput = (exId: string, setIdx: number, field: 'weight' | 'reps', val: string) => {
    setSessionExercises(prev => prev.map(e => {
      if (e.id === exId) {
        const newSets = [...e.sets];
        newSets[setIdx] = { ...newSets[setIdx], [field]: val };
        return { ...e, sets: newSets };
      }
      return e;
    }));
  };

  // Add dynamic set row
  const handleAddSet = (exId: string) => {
    setSessionExercises(prev => prev.map(e => {
      if (e.id === exId) {
        return {
          ...e,
          sets: [...e.sets, { weight: '', reps: '', isLogged: false }],
        };
      }
      return e;
    }));
  };

  // Delete last set row
  const handleRemoveSet = (exId: string) => {
    setSessionExercises(prev => prev.map(e => {
      if (e.id === exId && e.sets.length > 1) {
        const lastIdx = e.sets.length - 1;
        if (e.sets[lastIdx].isLogged) {
          removeSet(exId, lastIdx + 1);
        }
        return {
          ...e,
          sets: e.sets.slice(0, -1),
        };
      }
      return e;
    }));
  };

  // Append exercise manually from Library Popover
  const handleAddExerciseFromLibrary = (item: ExerciseLibItem) => {
    const isExAlreadyAdded = sessionExercises.some((e) => e.id === item.id);
    if (isExAlreadyAdded) {
      Alert.alert('Duplicate Exercise', `${item.name} is already in active tracker list.`);
      return;
    }

    setSessionExercises(prev => [
      ...prev,
      {
        id: item.id,
        name: item.name,
        target_muscle: item.target_muscle,
        equipment: item.equipment,
        sets: [
          { weight: '', reps: '', isLogged: false },
          { weight: '', reps: '', isLogged: false },
          { weight: '', reps: '', isLogged: false },
        ],
      },
    ]);
    setIsAddModalOpen(false);
    setSearchQuery('');
  };

  // Create custom exercise
  const handleCreateCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      Alert.alert('Validation Error', 'Custom exercise name required.');
      return;
    }

    const exId = 'ex-' + customExerciseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newEx = {
      id: exId,
      name: customExerciseName.trim(),
      target_muscle: customExerciseMuscle,
      equipment: 'Dumbbell', // Default
    };

    try {
      const db = getDb();
      await db.runAsync(
        'INSERT OR IGNORE INTO exercise_library (id, name, target_muscle, equipment, is_custom) VALUES (?, ?, ?, ?, 1)',
        newEx.id, newEx.name, newEx.target_muscle, newEx.equipment
      );
      
      handleAddExerciseFromLibrary(newEx);
      setCustomExerciseName('');
    } catch (err) {
      console.error('[WorkoutScreen] SQLite custom exercise insert failed:', err);
    }
  };

  // Finish session database write
  const handleFinishWorkout = async () => {
    // Ensure user has logged at least one set
    const totalLoggedSets = sessionExercises.reduce((acc, curr) => {
      return acc + curr.sets.filter((s) => s.isLogged).length;
    }, 0);

    if (totalLoggedSets === 0) {
      Alert.alert('Empty Session', 'Log at least one set to complete this training log.');
      return;
    }

    try {
      setRestActive(false);
      await finishSession(new Date().toISOString());
      Alert.alert('LOG COMPLETE', 'Workout telemetry session synchronized successfully.');
      navigation.navigate('Home');
    } catch (err: any) {
      Alert.alert('DATABASE FAULT', 'Save failed: ' + err.toString());
    }
  };

  // Discard workout session
  const handleDiscardWorkout = () => {
    Alert.alert(
      'ABORT TELEMETRY LOG',
      'Are you sure you want to discard this training log session? All unsaved logs will be permanently deleted.',
      [
        { text: 'RESUME LOGGING', style: 'cancel' },
        { 
          text: 'DISCARD LOG', 
          style: 'destructive',
          onPress: () => {
            setRestActive(false);
            clearSession();
          }
        }
      ]
    );
  };

  // Filter Library List
  const filteredLibrary = exerciseLibrary.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.target_muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Standby Offline screen
  if (!activeSession) {
    return (
      <View flex={1} bg="$background" jc="center" px="$5">
        <YStack gap="$6" maxW={450} w="100%" alignSelf="center" ai="center">
          
          {/* Standby Indicator */}
          <View 
            w={120} h={120} 
            br={999} 
            borderWidth={3} 
            borderColor="$borderHairline" 
            ai="center" jc="center"
            bg="$bgSurface"
          >
            <Clock size={40} color={theme.textDisabled.get() as string} />
          </View>
          
          <YStack ai="center" gap="$2">
            <Text color="$textDisabled" fontSize="$5" fontFamily="$heading">LOG DECK OFFLINE</Text>
            <Text color="$textSecondary" fontSize="$2" fontFamily="$body" textAlign="center">
              Boot routine protocol or start a freestyle training log to initiate diagnostics.
            </Text>
          </YStack>

          <YStack gap="$3" w="100%">
            <Button 
              title="START FREESTYLE SESSION" 
              onPress={() => startSession()} 
            />
            <Button 
              title="BOOT ROUTINE PROTOCOL" 
              variant="secondary"
              onPress={() => navigation.navigate('Routines')} 
            />
          </YStack>

        </YStack>
      </View>
    );
  }

  return (
    <View flex={1} bg="$background">
      
      {/* Search exercise overlay modal */}
      {isAddModalOpen && (
        <View position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(10,14,12,0.85)" zi={100} p="$4" jc="center">
          <YStack bg="$bgSurface" br="$3" p="$4" borderWidth={1} borderColor="$borderHairline" maxH="80%" gap="$4">
            <XStack jc="space-between" ai="center">
              <Text color="$accentPrimary" fontFamily="$heading" fontSize="$3">ADD MOVEMENT</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Text color="$stateError" fontFamily="$mono" fontSize="$2">CLOSE</Text>
              </TouchableOpacity>
            </XStack>

            <HUDInput 
              placeholder="Search library movements..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView flex={1} contentContainerStyle={{ gap: 8 }}>
              {filteredLibrary.map((item) => (
                <XStack 
                  key={item.id} 
                  jc="space-between" 
                  ai="center" 
                  p="$2.5" 
                  bg="$bgSurfaceRaised" 
                  br="$2" 
                  borderWidth={1} 
                  borderColor="$borderHairline"
                  pressStyle={{ borderColor: '$accentPrimary' }}
                  onPress={() => handleAddExerciseFromLibrary(item)}
                >
                  <YStack>
                    <Text color="$textPrimary" fontFamily="$body" fontSize="$2" fontWeight="bold">
                      {item.name}
                    </Text>
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
                      {item.target_muscle.toUpperCase()} • {item.equipment.toUpperCase()}
                    </Text>
                  </YStack>
                  <Plus size={16} color={theme.accentPrimary.get() as string} />
                </XStack>
              ))}

              {filteredLibrary.length === 0 && (
                <YStack gap="$2" p="$2" borderStyle="dashed" borderWidth={1} borderColor="$borderHairline" br="$2">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body" textAlign="center">
                    No matching movements found.
                  </Text>
                  
                  {/* Create custom exercise fields */}
                  <YStack gap="$2" mt="$2">
                    <HUDInput 
                      placeholder="Custom movement name..." 
                      value={customExerciseName}
                      onChangeText={setCustomExerciseName}
                    />
                    <XStack gap="$2" ai="center">
                      <Text color="$textSecondary" fontSize="$1" fontFamily="$body">TARGET MUSCLE:</Text>
                      <HUDInput 
                        placeholder="e.g. Chest" 
                        value={customExerciseMuscle}
                        onChangeText={setCustomExerciseMuscle}
                        flex={1}
                      />
                    </XStack>
                    <Button title="CREATE & ADD CUSTOM MOVEMENT" onPress={handleCreateCustomExercise} />
                  </YStack>
                </YStack>
              )}
            </ScrollView>
          </YStack>
        </View>
      )}

      {/* Main Logging Screen Container */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 50, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
        
        {/* Active Header Panel */}
        <XStack jc="space-between" ai="center" mb="$4" bg="$bgSurface" p="$3" br="$3" borderWidth={1} borderColor="$borderHairline">
          <YStack flex={2}>
            <Text color="$accentPrimary" fontSize="$4" fontFamily="$heading" numberOfLines={1}>{routineName.toUpperCase()}</Text>
            <XStack ai="center" gap="$1.5" mt="$1">
              <Clock size={12} color={theme.textSecondary.get() as string} />
              <Text color="$textSecondary" fontSize="$1" fontFamily="$mono" fontWeight="bold">{elapsedTime}</Text>
            </XStack>
          </YStack>
          
          <XStack gap="$2">
            <TouchableOpacity onPress={handleDiscardWorkout}>
              <View bg="$bgSurfaceRaised" p="$2.5" br="$2" borderWidth={1} borderColor="$stateError">
                <Trash2 size={16} color={theme.stateError.get() as string} />
              </View>
            </TouchableOpacity>
            
            <Button title="FINISH" onPress={handleFinishWorkout} />
          </XStack>
        </XStack>

        {/* Day Selector (for multi-day routine sessions) */}
        {routineDays.length > 1 && (
          <XStack gap="$2" mb="$4">
            {routineDays.map((d) => (
              <TouchableOpacity key={d} onPress={() => setSelectedDay(d)} style={{ flex: 1 }}>
                <View 
                  py="$2" 
                  ai="center" 
                  br="$2" 
                  borderWidth={1}
                  borderColor={selectedDay === d ? '$accentPrimary' : '$borderHairline'}
                  bg={selectedDay === d ? '$bgSurfaceRaised' : '$bgSurface'}
                >
                  <Text 
                    fontFamily="$mono" 
                    fontSize="$1" 
                    color={selectedDay === d ? '$accentPrimary' : '$textSecondary'}
                    fontWeight="bold"
                  >
                    DAY {d}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </XStack>
        )}

        {/* Exercises Lists */}
        <YStack gap="$4" mb="$6">
          {sessionExercises.map((ex) => (
            <Card key={ex.id} p="$3" br="$3" bg="$bgSurface" borderWidth={1} borderColor="$borderHairline">
              <XStack jc="space-between" ai="center" mb="$3">
                <YStack>
                  <Text color="$textPrimary" fontFamily="$heading" fontSize="$3">{ex.name}</Text>
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
                    {ex.target_muscle.toUpperCase()} • {ex.equipment.toUpperCase()}
                  </Text>
                </YStack>

                <XStack gap="$1.5">
                  <TouchableOpacity onPress={() => handleRemoveSet(ex.id)}>
                    <View bg="$bgBase" p="$1.5" br="$1" borderWidth={1} borderColor="$borderHairline">
                      <Trash2 size={10} color={theme.stateError.get() as string} />
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => handleAddSet(ex.id)}>
                    <View bg="$bgBase" p="$1.5" br="$1" borderWidth={1} borderColor="$borderHairline">
                      <Plus size={10} color={theme.accentPrimary.get() as string} />
                    </View>
                  </TouchableOpacity>
                </XStack>
              </XStack>

              {/* Set logging Table */}
              <YStack gap="$2">
                <XStack px="$2" py="$1" borderBottomWidth={1} borderBottomColor="$borderHairline" opacity={0.5}>
                  <Text flex={1} color="$textSecondary" fontFamily="$mono" fontSize="$1" textAlign="center">SET</Text>
                  <Text flex={2} color="$textSecondary" fontFamily="$mono" fontSize="$1" textAlign="center">LBS</Text>
                  <Text flex={2} color="$textSecondary" fontFamily="$mono" fontSize="$1" textAlign="center">REPS</Text>
                  <Text flex={1} color="$textSecondary" fontFamily="$mono" fontSize="$1" textAlign="center">SYNC</Text>
                </XStack>

                {ex.sets.map((set, setIdx) => (
                  <XStack 
                    key={setIdx} 
                    ai="center" 
                    py="$1.5" 
                    bg={set.isLogged ? 'rgba(57,255,106,0.06)' : 'transparent'} 
                    br="$2"
                    px="$1"
                  >
                    {/* Set Number */}
                    <Text flex={1} color={set.isLogged ? '$accentPrimary' : '$textSecondary'} fontFamily="$mono" fontSize="$2" textAlign="center" fontWeight="bold">
                      {setIdx + 1}
                    </Text>

                    {/* Weight Input */}
                    <View flex={2} px="$1">
                      <HUDInput 
                        placeholder="-" 
                        keyboardType="numeric"
                        textAlign="center"
                        value={set.weight}
                        onChangeText={(val) => handleChangeSetInput(ex.id, setIdx, 'weight', val)}
                        disabled={set.isLogged}
                      />
                    </View>

                    {/* Reps Input */}
                    <View flex={2} px="$1">
                      <HUDInput 
                        placeholder="-" 
                        keyboardType="numeric"
                        textAlign="center"
                        value={set.reps}
                        onChangeText={(val) => handleChangeSetInput(ex.id, setIdx, 'reps', val)}
                        disabled={set.isLogged}
                      />
                    </View>

                    {/* Logging Checkmark */}
                    <XStack flex={1} jc="center" ai="center">
                      <TouchableOpacity onPress={() => handleToggleSet(ex.id, setIdx)}>
                        <View 
                          w={28} h={28} 
                          br="$1" 
                          borderWidth={1} 
                          borderColor={set.isLogged ? '$accentPrimary' : '$borderHairline'} 
                          ai="center" jc="center"
                          bg={set.isLogged ? '$accentPrimary' : 'transparent'}
                        >
                          {set.isLogged ? (
                            <CheckCircle2 size={16} color="#0A0E0C" />
                          ) : (
                            <View w={8} h={8} br={99} bg="$borderHairline" />
                          )}
                        </View>
                      </TouchableOpacity>
                    </XStack>
                  </XStack>
                ))}
              </YStack>
            </Card>
          ))}

          {sessionExercises.length === 0 && (
            <Card p="$4" borderStyle="dashed" ai="center" jc="center" py="$6">
              <AlertTriangle size={24} color={theme.textDisabled.get() as string} />
              <Text color="$textSecondary" fontFamily="$body" fontSize="$2" textAlign="center" mt="$2">
                No exercises registered. Tap button below to load library logs.
              </Text>
            </Card>
          )}

          {/* Action Append Exercise */}
          <Button title="ADD MOVEMENT TO TRAINING LOG" variant="secondary" onPress={() => setIsAddModalOpen(true)} />
        </YStack>
      </ScrollView>

      {/* Floating HUD Rest Timer Footer */}
      {restActive && restSeconds > 0 && (
        <View 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0} 
          bg="$bgSurface" 
          borderTopWidth={1} 
          borderTopColor="$accentPrimary"
          p="$3"
          zi={50}
          shadowColor="$accentGlow"
          shadowRadius={15}
          shadowOpacity={0.8}
        >
          <XStack jc="space-between" ai="center">
            
            {/* Ticker status */}
            <YStack flex={2} gap="$1">
              <Text color="$accentPrimary" fontFamily="$mono" fontSize="$1" fontWeight="bold">REST PROTOCOL ACTIVE</Text>
              <Text color="$textPrimary" fontFamily="$mono" fontSize="$4" fontWeight="bold">
                {Math.floor(restSeconds / 60).toString().padStart(2, '0')}:{(restSeconds % 60).toString().padStart(2, '0')}
              </Text>
              
              {/* Dynamic countdown progress bar */}
              <View w="100%" h={2} bg="$bgBase" br="$1" mt="$1" overflow="hidden">
                <View h="100%" bg="$accentPrimary" w={`${(restSeconds / restMax) * 100}%`} />
              </View>
            </YStack>
            
            {/* Skip Actions */}
            <XStack gap="$2" flex={1} jc="flex-end" ai="center">
              <TouchableOpacity onPress={() => setRestSeconds(prev => prev + 30)}>
                <View py="$2" px="$3" bg="$bgSurfaceRaised" br="$1" borderWidth={1} borderColor="$borderHairline">
                  <Text color="$textPrimary" fontFamily="$mono" fontSize="$1">+30S</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setRestSeconds(0); setRestActive(false); }}>
                <View py="$2" px="$3" bg="$accentPrimary" br="$1">
                  <Text color="#0A0E0C" fontFamily="$mono" fontSize="$1" fontWeight="bold">SKIP</Text>
                </View>
              </TouchableOpacity>
            </XStack>

          </XStack>
        </View>
      )}

    </View>
  );
};
