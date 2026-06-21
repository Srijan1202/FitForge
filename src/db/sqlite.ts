import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export const getDb = () => {
  if (Platform.OS === 'web') {
    // Return mock database for web environment where WASM SQLite is unsupported/blocked
    return {
      execAsync: async (sql: string) => {
        console.log('[SQLite Web Mock] execAsync:', sql);
      },
      runAsync: async (sql: string, ...params: any[]) => {
        console.log('[SQLite Web Mock] runAsync:', sql, params);
        return { lastInsertRowId: 1, changes: 1 };
      },
      getFirstAsync: async (sql: string, ...params: any[]) => {
        console.log('[SQLite Web Mock] getFirstAsync:', sql, params);
        return null;
      },
      getAllAsync: async (sql: string, ...params: any[]) => {
        console.log('[SQLite Web Mock] getAllAsync:', sql, params);
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
  } catch (error) {
    console.warn('SQLite failed to initialize, using mock fallback:', error);
  }
};
