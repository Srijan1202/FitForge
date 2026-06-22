import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, XStack, YStack, styled, useTheme } from 'tamagui';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/useUserStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { getDb } from '../../db/sqlite';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Calendar, Clipboard, Play, Dumbbell, User } from 'lucide-react-native';
import { EXERCISE_LIBRARY_SEED } from '../../db/exerciseData';

const HUDInput = styled(Input, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$2',
  color: '$textPrimary',
  fontFamily: '$body',
  fontSize: '$2',
  paddingHorizontal: '$4',
  height: 50,
  
  focusStyle: {
    borderColor: '$accentPrimary',
    borderWidth: 1,
  },
});

interface Routine {
  id: string;
  user_id: string;
  routine_name: string;
  is_ai_generated: number;
  is_active: number;
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

const mapToExerciseId = (name: string) => {
  return 'ex-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

export const RoutinesScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const session = useUserStore((state) => state.session);
  const startSession = useWorkoutStore((state) => state.startSession);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineExercises, setRoutineExercises] = useState<Record<string, RoutineExercise[]>>({});
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  // Form State
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoutinesData = async () => {
    try {
      const db = getDb();

      // 1. Seed database with initial default templates if empty
      const routineCheck = await db.getFirstAsync('SELECT count(*) as cnt FROM routines') as { cnt: number };
      if (!routineCheck || routineCheck.cnt === 0) {
        console.log('[RoutinesScreen] Database routines table is empty. Seeding initial templates...');
        
        // Seed exercise library
        const placeholders = EXERCISE_LIBRARY_SEED.map(() => '(?, ?, ?, ?, 0)').join(', ');
        const flatParams = EXERCISE_LIBRARY_SEED.flatMap(ex => [ex.id, ex.name, ex.target_muscle, ex.equipment]);
        await db.runAsync(
          `INSERT OR IGNORE INTO exercise_library (id, name, target_muscle, equipment, is_custom) VALUES ${placeholders}`,
          ...flatParams
        );

        await db.execAsync(`
          INSERT OR IGNORE INTO routines (id, user_id, routine_name, is_ai_generated, is_active) VALUES
          ('seed-bro-split', 'system', 'Bro Split (Classic)', 0, 1),
          ('seed-ppl', 'system', 'Push Pull Legs', 0, 1);

          INSERT OR IGNORE INTO routine_exercises (id, routine_id, exercise_id, day_of_week, order_index, target_sets, target_reps) VALUES
          ('re-bro-1', 'seed-bro-split', 'ex-bench-press', 1, 1, 4, '8-12'),
          ('re-bro-2', 'seed-bro-split', 'ex-inc-db-press', 1, 2, 3, '8-12'),
          ('re-bro-3', 'seed-bro-split', 'ex-cable-flyes', 1, 3, 3, '12-15'),
          ('re-bro-4', 'seed-bro-split', 'ex-deadlift', 2, 1, 4, '5'),
          ('re-bro-5', 'seed-bro-split', 'ex-lat-pulldown', 2, 2, 3, '8-12'),
          ('re-bro-6', 'seed-bro-split', 'ex-bb-row', 2, 3, 3, '8-12'),
          ('re-bro-7', 'seed-bro-split', 'ex-ohp', 3, 1, 4, '8-12'),
          ('re-bro-8', 'seed-bro-split', 'ex-lat-raise', 3, 2, 4, '12-15'),
          ('re-bro-9', 'seed-bro-split', 'ex-face-pull', 3, 3, 3, '15'),
          ('re-bro-10', 'seed-bro-split', 'ex-squat', 4, 1, 4, '8-12'),
          ('re-bro-11', 'seed-bro-split', 'ex-rdl', 4, 2, 4, '8-12'),
          ('re-bro-12', 'seed-bro-split', 'ex-calf-raise', 4, 3, 4, '15'),
          ('re-bro-13', 'seed-bro-split', 'ex-bb-curl', 5, 1, 3, '10-12'),
          ('re-bro-14', 'seed-bro-split', 'ex-tri-pushdown', 5, 2, 3, '10-12'),
          ('re-bro-15', 'seed-bro-split', 'ex-hammer-curl', 5, 3, 3, '12'),

          ('re-ppl-1', 'seed-ppl', 'ex-bench-press', 1, 1, 4, '8-12'),
          ('re-ppl-2', 'seed-ppl', 'ex-ohp', 1, 2, 3, '8-12'),
          ('re-ppl-3', 'seed-ppl', 'ex-tri-pushdown', 1, 3, 3, '10-12'),
          ('re-ppl-4', 'seed-ppl', 'ex-lat-pulldown', 2, 1, 4, '8-12'),
          ('re-ppl-5', 'seed-ppl', 'ex-bb-curl', 2, 2, 3, '10-12'),
          ('re-ppl-6', 'seed-ppl', 'ex-bb-row', 2, 3, 3, '8-12'),
          ('re-ppl-7', 'seed-ppl', 'ex-squat', 3, 1, 4, '8-12'),
          ('re-ppl-8', 'seed-ppl', 'ex-leg-curl', 3, 2, 3, '10-12'),
          ('re-ppl-9', 'seed-ppl', 'ex-calf-raise', 3, 3, 3, '15');
        `);
      }

      // 2. Query routines
      const routineRows = await db.getAllAsync(
        'SELECT * FROM routines WHERE is_active = 1'
      ) as Routine[];

      // 3. Query all routine exercises joined with exercise library
      const exerciseRows = await db.getAllAsync(`
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
        ORDER BY re.day_of_week ASC, re.order_index ASC
      `) as RoutineExercise[];

      // Group exercises by routine ID
      const exercisesByRoutine: Record<string, RoutineExercise[]> = {};
      exerciseRows.forEach((row) => {
        if (!exercisesByRoutine[row.routine_id]) {
          exercisesByRoutine[row.routine_id] = [];
        }
        exercisesByRoutine[row.routine_id].push(row);
      });

      setRoutines(routineRows);
      setRoutineExercises(exercisesByRoutine);
      if (routineRows.length > 0 && !selectedRoutineId) {
        setSelectedRoutineId(routineRows[0].id);
      }
    } catch (err) {
      console.error('[RoutinesScreen] Failed to load routines from SQLite database:', err);
    }
  };

  useEffect(() => {
    loadRoutinesData();
  }, []);

  // Hybrid generator logic
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please input a system directive prompt.');
      return;
    }

    setError(null);
    setLoading(true);

    // Dynamic NLP local generator parsing
    setTimeout(async () => {
      try {
        const normalized = prompt.toLowerCase();
        
        // Days count extraction (default to 3)
        let targetDays = 3;
        const daysMatch = normalized.match(/(\d+)\s*day/);
        if (daysMatch) {
          targetDays = Math.max(1, Math.min(7, parseInt(daysMatch[1], 10)));
        }

        // Equipment extraction
        let eq: 'Barbell' | 'Dumbbell' | 'Bodyweight' = 'Barbell';
        if (normalized.includes('dumbbell') || normalized.includes('db')) {
          eq = 'Dumbbell';
        } else if (normalized.includes('bodyweight') || normalized.includes('calisthenics') || normalized.includes('home')) {
          eq = 'Bodyweight';
        }

        // Split type extraction
        let splitType: 'upper_lower' | 'ppl' | 'fullbody' | 'bro' = 'ppl';
        if (normalized.includes('upper') || normalized.includes('lower') || normalized.includes('split')) {
          splitType = 'upper_lower';
        } else if (normalized.includes('full') || normalized.includes('whole')) {
          splitType = 'fullbody';
        } else if (normalized.includes('bro') || normalized.includes('classic')) {
          splitType = 'bro';
        }

        // Generate customized routine name
        const eqLabel = eq === 'Dumbbell' ? 'Dumbbells' : eq === 'Bodyweight' ? 'Bodyweight' : 'Gym';
        const splitLabel = splitType === 'upper_lower' ? 'Upper/Lower' : splitType === 'fullbody' ? 'Full Body' : splitType === 'bro' ? 'Bro Split' : 'Push/Pull/Legs';
        const routineName = `AI ${targetDays}-Day ${splitLabel} (${eqLabel})`;

        // Build list of exercises dynamically
        interface TempEx {
          day_of_week: number;
          order_index: number;
          target_sets: number;
          target_reps: string;
          exercise_name: string;
          target_muscle: string;
          equipment: string;
        }
        const generatedExercises: TempEx[] = [];

        // Exercise database mapping dictionaries
        const EX_DICT: Record<string, Record<'Barbell' | 'Dumbbell' | 'Bodyweight', { name: string; muscle: string; equip: string }>> = {
          chest_primary: {
            Barbell: { name: 'Barbell Bench Press', muscle: 'Chest', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Bench Press', muscle: 'Chest', equip: 'Dumbbell' },
            Bodyweight: { name: 'Push-Ups', muscle: 'Chest', equip: 'Bodyweight' },
          },
          chest_secondary: {
            Barbell: { name: 'Incline Bench Press', muscle: 'Chest', equip: 'Barbell' },
            Dumbbell: { name: 'Incline Dumbbell Press', muscle: 'Chest', equip: 'Dumbbell' },
            Bodyweight: { name: 'Decline Push-Ups', muscle: 'Chest', equip: 'Bodyweight' },
          },
          back_primary: {
            Barbell: { name: 'Barbell Deadlift', muscle: 'Back', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Romanian Deadlift', muscle: 'Back', equip: 'Dumbbell' },
            Bodyweight: { name: 'Pull-Ups', muscle: 'Back', equip: 'Bodyweight' },
          },
          back_secondary: {
            Barbell: { name: 'Bent Over Barbell Row', muscle: 'Back', equip: 'Barbell' },
            Dumbbell: { name: 'Single Arm Dumbbell Row', muscle: 'Back', equip: 'Dumbbell' },
            Bodyweight: { name: 'Inverted Bodyweight Rows', muscle: 'Back', equip: 'Bodyweight' },
          },
          shoulders_primary: {
            Barbell: { name: 'Overhead Press', muscle: 'Shoulders', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equip: 'Dumbbell' },
            Bodyweight: { name: 'Pike Push-Ups', muscle: 'Shoulders', equip: 'Bodyweight' },
          },
          shoulders_secondary: {
            Barbell: { name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equip: 'Dumbbell' },
            Dumbbell: { name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equip: 'Dumbbell' },
            Bodyweight: { name: 'Plank Shoulder Taps', muscle: 'Shoulders', equip: 'Bodyweight' },
          },
          quads: {
            Barbell: { name: 'Barbell Squat', muscle: 'Legs', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Goblet Squat', muscle: 'Legs', equip: 'Dumbbell' },
            Bodyweight: { name: 'Air Squats', muscle: 'Legs', equip: 'Bodyweight' },
          },
          hamstrings: {
            Barbell: { name: 'Romanian Deadlift', muscle: 'Legs', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Romanian Deadlift', muscle: 'Legs', equip: 'Dumbbell' },
            Bodyweight: { name: 'Glute Bridges', muscle: 'Legs', equip: 'Bodyweight' },
          },
          calves: {
            Barbell: { name: 'Standing Calf Raise', muscle: 'Legs', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Calf Raise', muscle: 'Legs', equip: 'Dumbbell' },
            Bodyweight: { name: 'Bodyweight Calf Raises', muscle: 'Legs', equip: 'Bodyweight' },
          },
          biceps: {
            Barbell: { name: 'Barbell Bicep Curl', muscle: 'Arms', equip: 'Barbell' },
            Dumbbell: { name: 'Dumbbell Bicep Curl', muscle: 'Arms', equip: 'Dumbbell' },
            Bodyweight: { name: 'Chinups', muscle: 'Arms', equip: 'Bodyweight' },
          },
          triceps: {
            Barbell: { name: 'Tricep Pushdown', muscle: 'Arms', equip: 'Cables' },
            Dumbbell: { name: 'Dumbbell Overhead Extension', muscle: 'Arms', equip: 'Dumbbell' },
            Bodyweight: { name: 'Bench Dips', muscle: 'Arms', equip: 'Bodyweight' },
          },
          core: {
            Barbell: { name: 'Plank Hold', muscle: 'Core', equip: 'Bodyweight' },
            Dumbbell: { name: 'Dumbbell Russian Twist', muscle: 'Core', equip: 'Dumbbell' },
            Bodyweight: { name: 'Hanging Leg Raises', muscle: 'Core', equip: 'Bodyweight' },
          },
        };

        // Populate days
        for (let d = 1; d <= targetDays; d++) {
          if (splitType === 'upper_lower') {
            const isUpper = d % 2 !== 0;
            if (isUpper) {
              // Upper Day
              generatedExercises.push(
                { day_of_week: d, order_index: 1, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.chest_primary[eq].name, target_muscle: EX_DICT.chest_primary[eq].muscle, equipment: EX_DICT.chest_primary[eq].equip },
                { day_of_week: d, order_index: 2, target_sets: 3, target_reps: '8-12', exercise_name: EX_DICT.back_primary[eq].name, target_muscle: EX_DICT.back_primary[eq].muscle, equipment: EX_DICT.back_primary[eq].equip },
                { day_of_week: d, order_index: 3, target_sets: 3, target_reps: '8-12', exercise_name: EX_DICT.shoulders_primary[eq].name, target_muscle: EX_DICT.shoulders_primary[eq].muscle, equipment: EX_DICT.shoulders_primary[eq].equip },
                { day_of_week: d, order_index: 4, target_sets: 3, target_reps: '10-12', exercise_name: EX_DICT.triceps[eq].name, target_muscle: EX_DICT.triceps[eq].muscle, equipment: EX_DICT.triceps[eq].equip }
              );
            } else {
              // Lower Day
              generatedExercises.push(
                { day_of_week: d, order_index: 1, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.quads[eq].name, target_muscle: EX_DICT.quads[eq].muscle, equipment: EX_DICT.quads[eq].equip },
                { day_of_week: d, order_index: 2, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.hamstrings[eq].name, target_muscle: EX_DICT.hamstrings[eq].muscle, equipment: EX_DICT.hamstrings[eq].equip },
                { day_of_week: d, order_index: 3, target_sets: 3, target_reps: '15', exercise_name: EX_DICT.calves[eq].name, target_muscle: EX_DICT.calves[eq].muscle, equipment: EX_DICT.calves[eq].equip },
                { day_of_week: d, order_index: 4, target_sets: 3, target_reps: '15', exercise_name: EX_DICT.core[eq].name, target_muscle: EX_DICT.core[eq].muscle, equipment: EX_DICT.core[eq].equip }
              );
            }
          } else if (splitType === 'ppl') {
            const rot = (d - 1) % 3; // 0 = Push, 1 = Pull, 2 = Legs
            if (rot === 0) {
              generatedExercises.push(
                { day_of_week: d, order_index: 1, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.chest_primary[eq].name, target_muscle: EX_DICT.chest_primary[eq].muscle, equipment: EX_DICT.chest_primary[eq].equip },
                { day_of_week: d, order_index: 2, target_sets: 3, target_reps: '8-12', exercise_name: EX_DICT.shoulders_primary[eq].name, target_muscle: EX_DICT.shoulders_primary[eq].muscle, equipment: EX_DICT.shoulders_primary[eq].equip },
                { day_of_week: d, order_index: 3, target_sets: 3, target_reps: '10-12', exercise_name: EX_DICT.triceps[eq].name, target_muscle: EX_DICT.triceps[eq].muscle, equipment: EX_DICT.triceps[eq].equip }
              );
            } else if (rot === 1) {
              generatedExercises.push(
                { day_of_week: d, order_index: 1, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.back_primary[eq].name, target_muscle: EX_DICT.back_primary[eq].muscle, equipment: EX_DICT.back_primary[eq].equip },
                { day_of_week: d, order_index: 2, target_sets: 3, target_reps: '8-12', exercise_name: EX_DICT.back_secondary[eq].name, target_muscle: EX_DICT.back_secondary[eq].muscle, equipment: EX_DICT.back_secondary[eq].equip },
                { day_of_week: d, order_index: 3, target_sets: 3, target_reps: '10-12', exercise_name: EX_DICT.biceps[eq].name, target_muscle: EX_DICT.biceps[eq].muscle, equipment: EX_DICT.biceps[eq].equip }
              );
            } else {
              generatedExercises.push(
                { day_of_week: d, order_index: 1, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.quads[eq].name, target_muscle: EX_DICT.quads[eq].muscle, equipment: EX_DICT.quads[eq].equip },
                { day_of_week: d, order_index: 2, target_sets: 3, target_reps: '10-12', exercise_name: EX_DICT.hamstrings[eq].name, target_muscle: EX_DICT.hamstrings[eq].muscle, equipment: EX_DICT.hamstrings[eq].equip },
                { day_of_week: d, order_index: 3, target_sets: 3, target_reps: '15', exercise_name: EX_DICT.calves[eq].name, target_muscle: EX_DICT.calves[eq].muscle, equipment: EX_DICT.calves[eq].equip }
              );
            }
          } else {
            // Full Body Split (Fallback / standard)
            generatedExercises.push(
              { day_of_week: d, order_index: 1, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.quads[eq].name, target_muscle: EX_DICT.quads[eq].muscle, equipment: EX_DICT.quads[eq].equip },
              { day_of_week: d, order_index: 2, target_sets: 4, target_reps: '8-12', exercise_name: EX_DICT.chest_primary[eq].name, target_muscle: EX_DICT.chest_primary[eq].muscle, equipment: EX_DICT.chest_primary[eq].equip },
              { day_of_week: d, order_index: 3, target_sets: 3, target_reps: '8-12', exercise_name: EX_DICT.back_primary[eq].name, target_muscle: EX_DICT.back_primary[eq].muscle, equipment: EX_DICT.back_primary[eq].equip },
              { day_of_week: d, order_index: 4, target_sets: 3, target_reps: '12-15', exercise_name: EX_DICT.core[eq].name, target_muscle: EX_DICT.core[eq].muscle, equipment: EX_DICT.core[eq].equip }
            );
          }
        }

        // 4. Save generated routine data to SQLite
        const db = getDb();
        const genRoutineId = 'ai-routine-' + Math.random().toString(36).substring(2, 11);
        const userId = session?.user?.id || 'demo-user-uuid-0000-0000';

        await db.runAsync(
          'INSERT INTO routines (id, user_id, routine_name, is_ai_generated, is_active) VALUES (?, ?, ?, 1, 1)',
          genRoutineId, userId, routineName
        );

        for (let i = 0; i < generatedExercises.length; i++) {
          const ex = generatedExercises[i];
          const exId = mapToExerciseId(ex.exercise_name);
          const reId = 'ai-re-' + Math.random().toString(36).substring(2, 11);

          // Add to exercise_library if ignore fails
          await db.runAsync(
            'INSERT OR IGNORE INTO exercise_library (id, name, target_muscle, equipment) VALUES (?, ?, ?, ?)',
            exId, ex.exercise_name, ex.target_muscle, ex.equipment
          );

          // Add to routine_exercises
          await db.runAsync(
            'INSERT INTO routine_exercises (id, routine_id, exercise_id, day_of_week, order_index, target_sets, target_reps) VALUES (?, ?, ?, ?, ?, ?, ?)',
            reId, genRoutineId, exId, ex.day_of_week, ex.order_index, ex.target_sets, ex.target_reps
          );
        }

        console.log('[RoutinesScreen] SQLite insertions completed for routine: ' + routineName);
        
        // Reload routines from SQLite
        await loadRoutinesData();
        setSelectedRoutineId(genRoutineId);
        setPrompt('');
        setLoading(false);
      } catch (err: any) {
        setError('Generation runtime fault: ' + (err.message || err.toString()));
        setLoading(false);
      }
    }, 1200); // 1.2s delay for retro HUD calibrating feedback
  };

  // Launch routine log session in Log Screen
  const handleBootProtocol = (rId: string) => {
    startSession(rId);
    navigation.navigate('Log');
  };

  const activeRoutine = routines.find((r) => r.id === selectedRoutineId);
  const activeExercises = selectedRoutineId ? routineExercises[selectedRoutineId] || [] : [];

  // Group active exercises by Day of Week
  const exercisesByDay: Record<number, RoutineExercise[]> = {};
  activeExercises.forEach((ex) => {
    if (!exercisesByDay[ex.day_of_week]) {
      exercisesByDay[ex.day_of_week] = [];
    }
    exercisesByDay[ex.day_of_week].push(ex);
  });

  const sortedDays = Object.keys(exercisesByDay).map(Number).sort((a, b) => a - b);

  return (
    <View flex={1} bg="$background">
      <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 80 }}>
        
        {/* Screen Header */}
        <YStack mb="$4" mt="$4">
          <Text color="$color" fontSize="$5" fontFamily="$heading">DIRECTIVE SCHEDULER</Text>
          <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
            MANAGE ROUTINES & AI GENERATION CALIBRATION
          </Text>
        </YStack>
        
        {/* Card 1: AI Prompt Console */}
        <Card mb="$4" raised>
          <XStack ai="center" gap="$2" mb="$2">
            <Sparkles size={16} color={theme.accentPrimary.get() as string} />
            <CardTitle>AI ROUTINE GENERATOR</CardTitle>
          </XStack>
          <CardSubtitle mb="$3">Calibrate workout vectors using natural directives.</CardSubtitle>
          
          <YStack gap="$3">
            <HUDInput 
              placeholder="e.g. 4-day upper lower dumbbell split..." 
              value={prompt} 
              onChangeText={setPrompt} 
              disabled={loading}
            />

            {error && (
              <View bg="$bgSurface" borderColor="$stateError" borderWidth={1} br="$2" p="$2.5">
                <Text color="$stateError" fontFamily="$mono" fontSize="$1">
                  SYS ERROR: {error.toUpperCase()}
                </Text>
              </View>
            )}

            <Button 
              title={loading ? 'CALIBRATING VECTORS...' : 'RUN GENERATION PROTOCOL'} 
              disabled={loading}
              onPress={handleGenerate}
            />
          </YStack>
        </Card>

        {/* Dynamic Routines List */}
        <Text color="$textSecondary" fontSize="$1" fontFamily="$body" mb="$2">AVAILABLE PHYSICAL TEMPLATES</Text>

        <XStack gap="$3" mb="$4" flexWrap="wrap">
          {routines.map((r) => {
            const isSelected = selectedRoutineId === r.id;
            return (
              <Card 
                key={r.id} 
                flex={1}
                minWidth="45%"
                p="$3"
                br="$3"
                borderWidth={1}
                borderColor={isSelected ? '$accentPrimary' : '$borderHairline'}
                bg={isSelected ? '$bgSurfaceRaised' : '$bgSurface'}
                pressStyle={{ scale: 0.98 }}
                onPress={() => setSelectedRoutineId(r.id)}
                shadowColor={isSelected ? '$accentGlow' : 'transparent'}
                shadowRadius={10}
                shadowOpacity={1}
              >
                <XStack jc="space-between" ai="center" mb="$1">
                  <Text 
                    color={isSelected ? '$accentPrimary' : '$textPrimary'} 
                    fontFamily="$heading" 
                    fontSize="$2"
                    numberOfLines={1}
                  >
                    {r.routine_name}
                  </Text>
                </XStack>
                <XStack ai="center" gap="$1">
                  {r.is_ai_generated ? (
                    <Sparkles size={10} color={theme.accentPrimary.get() as string} />
                  ) : (
                    <User size={10} color={theme.textSecondary.get() as string} />
                  )}
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
                    {r.is_ai_generated ? 'AI CORRELATE' : 'FACTORY SPEC'}
                  </Text>
                </XStack>
              </Card>
            );
          })}
        </XStack>

        {/* Card 3: Routine Specifications Detail Panel */}
        {activeRoutine && (
          <Card mb="$4" borderStyle="dashed">
            <XStack jc="space-between" ai="center" mb="$3" pb="$2" borderBottomWidth={1} borderBottomColor="$borderHairline">
              <YStack>
                <CardTitle>{activeRoutine.routine_name.toUpperCase()}</CardTitle>
                <CardSubtitle>SPECIFICATION DATA GRID</CardSubtitle>
              </YStack>
              <Clipboard size={16} color={theme.accentPrimary.get() as string} />
            </XStack>

            <ScrollView maxHeight={280} style={{ marginVertical: 4 }}>
              <YStack gap="$4">
                {sortedDays.map((dayNum) => {
                  const dayExes = exercisesByDay[dayNum] || [];
                  return (
                    <YStack key={dayNum} gap="$2">
                      <XStack ai="center" gap="$1.5" bg="$bgSurfaceRaised" py="$1" px="$2.5" br="$2">
                        <Calendar size={12} color={theme.accentPrimary.get() as string} />
                        <Text color="$accentPrimary" fontFamily="$mono" fontSize="$1" fontWeight="bold">
                          CYCLE PROTOCOL {dayNum.toString().padStart(2, '0')}
                        </Text>
                      </XStack>

                      <YStack gap="$1.5" pl="$2">
                        {dayExes.map((ex) => (
                          <XStack key={ex.id} jc="space-between" ai="center" py="$1" borderBottomWidth={1} borderBottomColor="$borderHairline" opacity={0.85}>
                            <YStack flex={2}>
                              <Text color="$textPrimary" fontFamily="$body" fontSize="$2" fontWeight="500">
                                {ex.exercise_name}
                              </Text>
                              <Text color="$textSecondary" fontFamily="$body" fontSize="$1">
                                {ex.target_muscle.toUpperCase()} • {ex.equipment.toUpperCase()}
                              </Text>
                            </YStack>
                            <XStack flex={1} jc="flex-end" ai="center" gap="$1">
                              <Text color="$accentPrimary" fontFamily="$mono" fontSize="$2" fontWeight="bold">
                                {ex.target_sets}
                              </Text>
                              <Text color="$textSecondary" fontFamily="$mono" fontSize="$1">
                                x
                              </Text>
                              <Text color="$textPrimary" fontFamily="$mono" fontSize="$2">
                                {ex.target_reps}
                              </Text>
                            </XStack>
                          </XStack>
                        ))}
                      </YStack>
                    </YStack>
                  );
                })}
              </YStack>
            </ScrollView>

            {/* Boot Protocol button */}
            <XStack mt="$4" pt="$3" borderTopWidth={1} borderTopColor="$borderHairline">
              <Button 
                title="BOOT TRAINING LOG PROTOCOL" 
                flex={1}
                variant="primary"
                onPress={() => handleBootProtocol(activeRoutine.id)}
              >
                <XStack ai="center" gap="$2">
                  <Play size={14} color="#0A0E0C" />
                  <Text color="#0A0E0C" fontFamily="$heading" fontSize="$2" fontWeight="bold">
                    BOOT TRAINING LOG PROTOCOL
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </Card>
        )}

      </ScrollView>
    </View>
  );
};
