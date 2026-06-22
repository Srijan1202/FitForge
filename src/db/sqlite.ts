import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { EXERCISE_LIBRARY_SEED } from './exerciseData';

// LocalStorage helpers for Web mock
const getLocalStorageData = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  }
  return defaultValue;
};

const setLocalStorageData = (key: string, data: any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
};

export const getDb = () => {
  if (Platform.OS === 'web') {
    // Return robust mock database for web environment
    return {
      execAsync: async (sql: string) => {
        console.log('[SQLite Web Mock] execAsync:', sql);
        return;
      },
      runAsync: async (sql: string, ...params: any[]) => {
        console.log('[SQLite Web Mock] runAsync:', sql, params);
        
        let mockExercises = getLocalStorageData('fitforge_mock_exercises', []);
        let mockRoutines = getLocalStorageData('fitforge_mock_routines', []);
        let mockRoutineExercises = getLocalStorageData('fitforge_mock_routine_exercises', []);
        let mockWorkoutSessions = getLocalStorageData('fitforge_mock_workout_sessions', []);
        let mockLogs = getLocalStorageData('fitforge_mock_logs', []);
        let mockNutritionLogs = getLocalStorageData('fitforge_mock_nutrition_logs', []);
        let mockUsers = getLocalStorageData('fitforge_mock_users', []);

        // Seed initial exercises if empty
        if (mockExercises.length === 0) {
          mockExercises = EXERCISE_LIBRARY_SEED.map(ex => ({
            id: ex.id,
            name: ex.name,
            target_muscle: ex.target_muscle,
            equipment: ex.equipment,
            gif_url: null,
            is_custom: 0,
            created_by: null
          }));
          setLocalStorageData('fitforge_mock_exercises', mockExercises);
        }

        const normalizedSql = sql.trim().toLowerCase();

        if (normalizedSql.startsWith('insert or ignore into exercise_library')) {
          const id = params[0];
          const name = params[1];
          const target_muscle = params[2];
          const equipment = params[3];
          const is_custom = params[4] || 0;
          if (!mockExercises.some((e: any) => e.id === id)) {
            mockExercises.push({ id, name, target_muscle, equipment, is_custom, gif_url: null, created_by: null });
            setLocalStorageData('fitforge_mock_exercises', mockExercises);
          }
        } 
        else if (normalizedSql.startsWith('insert or ignore into routines')) {
          // Used in RoutinesScreen seeding
          // Bulk insert of multiple rows or single row
          if (!mockRoutines.some((r: any) => r.id === 'seed-bro-split')) {
            mockRoutines = [
              { id: 'seed-bro-split', user_id: 'system', routine_name: 'Bro Split (Classic)', is_ai_generated: 0, is_active: 1 },
              { id: 'seed-ppl', user_id: 'system', routine_name: 'Push Pull Legs', is_ai_generated: 0, is_active: 1 }
            ];
            setLocalStorageData('fitforge_mock_routines', mockRoutines);
          }
        }
        else if (normalizedSql.startsWith('insert or ignore into routine_exercises')) {
          // Bulk routine exercises seeding
          if (mockRoutineExercises.length === 0) {
            mockRoutineExercises = [
              { id: 're-bro-1', routine_id: 'seed-bro-split', exercise_id: 'ex-bench-press', day_of_week: 1, order_index: 1, target_sets: 4, target_reps: '8-12' },
              { id: 're-bro-2', routine_id: 'seed-bro-split', exercise_id: 'ex-inc-db-press', day_of_week: 1, order_index: 2, target_sets: 3, target_reps: '8-12' },
              { id: 're-bro-3', routine_id: 'seed-bro-split', exercise_id: 'ex-cable-flyes', day_of_week: 1, order_index: 3, target_sets: 3, target_reps: '12-15' },
              { id: 're-bro-4', routine_id: 'seed-bro-split', exercise_id: 'ex-deadlift', day_of_week: 2, order_index: 1, target_sets: 4, target_reps: '5' },
              { id: 're-bro-5', routine_id: 'seed-bro-split', exercise_id: 'ex-lat-pulldown', day_of_week: 2, order_index: 2, target_sets: 3, target_reps: '8-12' },
              { id: 're-bro-6', routine_id: 'seed-bro-split', exercise_id: 'ex-bb-row', day_of_week: 2, order_index: 3, target_sets: 3, target_reps: '8-12' },
              { id: 're-bro-7', routine_id: 'seed-bro-split', exercise_id: 'ex-ohp', day_of_week: 3, order_index: 1, target_sets: 4, target_reps: '8-12' },
              { id: 're-bro-8', routine_id: 'seed-bro-split', exercise_id: 'ex-lat-raise', day_of_week: 3, order_index: 2, target_sets: 4, target_reps: '12-15' },
              { id: 're-bro-9', routine_id: 'seed-bro-split', exercise_id: 'ex-face-pull', day_of_week: 3, order_index: 3, target_sets: 3, target_reps: '15' },
              { id: 're-bro-10', routine_id: 'seed-bro-split', exercise_id: 'ex-squat', day_of_week: 4, order_index: 1, target_sets: 4, target_reps: '8-12' },
              { id: 're-bro-11', routine_id: 'seed-bro-split', exercise_id: 'ex-rdl', day_of_week: 4, order_index: 2, target_sets: 3, target_reps: '8-12' },
              { id: 're-bro-12', routine_id: 'seed-bro-split', exercise_id: 'ex-leg-curl', day_of_week: 4, order_index: 3, target_sets: 3, target_reps: '10-12' }
            ];
            setLocalStorageData('fitforge_mock_routine_exercises', mockRoutineExercises);
          }
        }
        else if (normalizedSql.startsWith('insert into workout_sessions')) {
          const id = params[0];
          const user_id = params[1];
          const routine_id = params[2];
          const started_at = params[3];
          // Clear active session first (mark others completed)
          mockWorkoutSessions = mockWorkoutSessions.map((s: any) => ({ ...s, completed_at: s.completed_at || new Date().toISOString() }));
          mockWorkoutSessions.push({ id, user_id, routine_id, started_at, completed_at: null });
          setLocalStorageData('fitforge_mock_workout_sessions', mockWorkoutSessions);
        }
        else if (normalizedSql.startsWith('update workout_sessions')) {
          const completed_at = params[0];
          const id = params[1];
          mockWorkoutSessions = mockWorkoutSessions.map((s: any) => 
            s.id === id ? { ...s, completed_at } : s
          );
          setLocalStorageData('fitforge_mock_workout_sessions', mockWorkoutSessions);
        }
        else if (normalizedSql.startsWith('insert into logs') || normalizedSql.startsWith('insert or replace into logs')) {
          const id = params[0] || Math.random().toString();
          const session_id = params[1];
          const exercise_id = params[2];
          const set_number = params[3];
          const weight_lifted = params[4];
          const reps = params[5];
          const date_completed = params[6] || new Date().toISOString();
          const client_uuid = params[7] || id;
          
          // Remove duplicate if exists
          mockLogs = mockLogs.filter((l: any) => !(l.session_id === session_id && l.exercise_id === exercise_id && l.set_number === set_number));
          mockLogs.push({ id, session_id, exercise_id, set_number, weight_lifted, reps, date_completed, client_uuid });
          setLocalStorageData('fitforge_mock_logs', mockLogs);
        }
        else if (normalizedSql.startsWith('delete from logs')) {
          const session_id = params[0];
          const exercise_id = params[1];
          const set_number = params[2];
          mockLogs = mockLogs.filter((l: any) => !(l.session_id === session_id && l.exercise_id === exercise_id && l.set_number === set_number));
          setLocalStorageData('fitforge_mock_logs', mockLogs);
        }
        else if (normalizedSql.startsWith('insert or replace into users')) {
          const id = params[0];
          const name = params[1];
          const age = params[2];
          const weight_kg = params[3];
          const height_cm = params[4];
          const fitness_goal = params[5];
          const daily_calories = params[6];
          const daily_protein_g = params[7];
          const daily_carbs_g = params[8];
          const daily_fats_g = params[9];
          const hostel = params[10];
          const mess = params[11];

          mockUsers = mockUsers.filter((u: any) => u.id !== id);
          mockUsers.push({ id, name, age, weight_kg, height_cm, fitness_goal, daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g, hostel, mess });
          setLocalStorageData('fitforge_mock_users', mockUsers);
        }
        else if (normalizedSql.startsWith('insert into nutrition_logs')) {
          const id = params[0] || Math.random().toString();
          const user_id = params[1];
          const log_date = params[2];
          const description = params[3];
          const calories = params[4];
          const protein_g = params[5];
          const carbs_g = params[6];
          const fats_g = params[7];
          const source = params[8] || 'manual';

          mockNutritionLogs.push({ id, user_id, log_date, description, calories, protein_g, carbs_g, fats_g, source });
          setLocalStorageData('fitforge_mock_nutrition_logs', mockNutritionLogs);
        }
        else if (normalizedSql.startsWith('delete from nutrition_logs')) {
          const id = params[0];
          mockNutritionLogs = mockNutritionLogs.filter((l: any) => l.id !== id);
          setLocalStorageData('fitforge_mock_nutrition_logs', mockNutritionLogs);
        }

        return { lastInsertRowId: 1, changes: 1 };
      },
      getFirstAsync: async (sql: string, ...params: any[]) => {
        console.log('[SQLite Web Mock] getFirstAsync:', sql, params);

        let mockRoutines = getLocalStorageData('fitforge_mock_routines', []);
        let mockWorkoutSessions = getLocalStorageData('fitforge_mock_workout_sessions', []);

        const normalizedSql = sql.trim().toLowerCase();

        if (normalizedSql.startsWith('select count(*) as cnt from routines')) {
          return { cnt: mockRoutines.length };
        }
        else if (normalizedSql.startsWith('select routine_name from routines where id = ?')) {
          const match = mockRoutines.find((r: any) => r.id === params[0]);
          return match ? { routine_name: match.routine_name } : null;
        }
        else if (normalizedSql.includes('workout_sessions') && normalizedSql.includes('completed_at is null')) {
          return mockWorkoutSessions.find((s: any) => !s.completed_at) || null;
        }
        else if (normalizedSql.includes('select id, routine_name from routines where is_active = 1')) {
          return mockRoutines.find((r: any) => r.is_active === 1) || null;
        }

        return null;
      },
      getAllAsync: async (sql: string, ...params: any[]) => {
        console.log('[SQLite Web Mock] getAllAsync:', sql, params);

        let mockExercises = getLocalStorageData('fitforge_mock_exercises', []);
        let mockRoutines = getLocalStorageData('fitforge_mock_routines', []);
        let mockRoutineExercises = getLocalStorageData('fitforge_mock_routine_exercises', []);
        let mockLogs = getLocalStorageData('fitforge_mock_logs', []);
        let mockNutritionLogs = getLocalStorageData('fitforge_mock_nutrition_logs', []);

        // Seed initial exercises if empty
        if (mockExercises.length === 0) {
          mockExercises = EXERCISE_LIBRARY_SEED.map(ex => ({
            id: ex.id,
            name: ex.name,
            target_muscle: ex.target_muscle,
            equipment: ex.equipment,
            gif_url: null,
            is_custom: 0,
            created_by: null
          }));
          setLocalStorageData('fitforge_mock_exercises', mockExercises);
        }

        const normalizedSql = sql.trim().toLowerCase();

        if (normalizedSql.startsWith('select * from exercise_library')) {
          return mockExercises;
        }
        else if (normalizedSql.startsWith('select * from routines')) {
          return mockRoutines;
        }
        else if (normalizedSql.includes('from routine_exercises')) {
          // Joined query
          const routineId = params[0];
          const dayOfWeek = params[1];
          let dayFiltered = mockRoutineExercises.filter((re: any) => re.routine_id === routineId);
          if (dayOfWeek !== undefined) {
            dayFiltered = dayFiltered.filter((re: any) => re.day_of_week === dayOfWeek);
          }
          return dayFiltered.map((re: any) => {
            const exInfo = mockExercises.find((e: any) => e.id === re.exercise_id) || { name: 'Unknown', target_muscle: 'Full Body', equipment: 'None' };
            return {
              id: re.exercise_id,
              name: exInfo.name,
              target_muscle: exInfo.target_muscle,
              target_sets: re.target_sets,
              target_reps: re.target_reps,
              routine_id: re.routine_id,
              exercise_id: re.exercise_id,
              day_of_week: re.day_of_week,
              order_index: re.order_index,
              exercise_name: exInfo.name,
              equipment: exInfo.equipment
            };
          });
        }
        else if (normalizedSql.startsWith('select * from logs')) {
          return mockLogs.filter((l: any) => l.session_id === params[0]);
        }
        else if (normalizedSql.startsWith('select * from nutrition_logs')) {
          const date = params[0];
          return mockNutritionLogs.filter((l: any) => l.log_date === date).reverse();
        }

        return [];
      },
    } as any;
  }
  return SQLite.openDatabaseSync('fitforge.db');
};

export const initDb = async () => {
  try {
    const db = getDb();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER,
        weight_kg REAL,
        height_cm REAL,
        fitness_goal TEXT,
        daily_calories INTEGER,
        daily_protein_g INTEGER,
        daily_carbs_g INTEGER,
        daily_fats_g INTEGER
      );

      CREATE TABLE IF NOT EXISTS exercise_library (
        id TEXT PRIMARY KEY,
        name TEXT,
        target_muscle TEXT,
        equipment TEXT,
        gif_url TEXT,
        is_custom INTEGER DEFAULT 0,
        created_by TEXT NULL
      );

      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        routine_name TEXT,
        is_ai_generated INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS routine_exercises (
        id TEXT PRIMARY KEY,
        routine_id TEXT,
        exercise_id TEXT,
        day_of_week INTEGER,
        order_index INTEGER,
        target_sets INTEGER,
        target_reps TEXT,
        FOREIGN KEY(routine_id) REFERENCES routines(id),
        FOREIGN KEY(exercise_id) REFERENCES exercise_library(id)
      );

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        routine_id TEXT NULL,
        started_at TEXT,
        completed_at TEXT NULL,
        sync_status TEXT DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        exercise_id TEXT,
        set_number INTEGER,
        weight_lifted REAL,
        reps INTEGER,
        date_completed TEXT,
        client_uuid TEXT UNIQUE,
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY(session_id) REFERENCES workout_sessions(id),
        FOREIGN KEY(exercise_id) REFERENCES exercise_library(id)
      );

      CREATE TABLE IF NOT EXISTS nutrition_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        log_date TEXT,
        description TEXT,
        calories INTEGER,
        protein_g REAL,
        carbs_g REAL,
        fats_g REAL,
        source TEXT,
        sync_status TEXT DEFAULT 'pending'
      );
    `);
    
    // Add columns dynamically if missing in older schema versions
    try {
      await db.execAsync('ALTER TABLE users ADD COLUMN hostel TEXT;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE users ADD COLUMN mess TEXT;');
    } catch (_) {}

    // Seed exercise library if empty on native device
    if (Platform.OS !== 'web') {
      const checkEx = await db.getFirstAsync('SELECT count(*) as cnt FROM exercise_library') as { cnt: number };
      if (!checkEx || checkEx.cnt === 0) {
        console.log('[sqlite] Seeding exercise library on native boot...');
        const placeholders = EXERCISE_LIBRARY_SEED.map(() => '(?, ?, ?, ?, 0)').join(', ');
        const flatParams = EXERCISE_LIBRARY_SEED.flatMap(ex => [ex.id, ex.name, ex.target_muscle, ex.equipment]);
        await db.runAsync(
          `INSERT OR IGNORE INTO exercise_library (id, name, target_muscle, equipment, is_custom) VALUES ${placeholders}`,
          ...flatParams
        );
      }
    }
  } catch (error) {
    console.warn('SQLite failed to initialize, using mock fallback:', error);
  }
};
