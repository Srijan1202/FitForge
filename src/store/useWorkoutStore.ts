import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from '../db/sqlite';
import { useUserStore } from './useUserStore';
import { supabase } from '../api/supabase';

export interface WorkoutLog {
  id: string; // client uuid
  exercise_id: string;
  set_number: number;
  weight_lifted: number;
  reps: number;
  date_completed: string;
  sync_status: 'pending' | 'synced';
}

export interface SessionExercise {
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

export interface ActiveSession {
  id: string;
  routine_id: string | null;
  started_at: string;
  logs: WorkoutLog[];
  exercises: SessionExercise[];
  selected_day: number;
}

interface WorkoutState {
  activeSession: ActiveSession | null;
  offlineQueue: WorkoutLog[];
  startSession: (routineId?: string) => void;
  logSet: (log: Omit<WorkoutLog, 'id' | 'date_completed' | 'sync_status'>) => void;
  removeSet: (exerciseId: string, setNumber: number) => void;
  finishSession: (completedAt: string) => Promise<void>;
  clearQueue: () => void;
  updateExercises: (exercises: SessionExercise[]) => void;
  setSelectedDayInSession: (day: number) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      offlineQueue: [],
      startSession: (routineId) => set({
        activeSession: {
          id: Date.now().toString(), // Simple client UUID, in reality use a real UUID
          routine_id: routineId || null,
          started_at: new Date().toISOString(),
          logs: [],
          exercises: [],
          selected_day: 1,
        }
      }),
      logSet: (logData) => set((state) => {
        if (!state.activeSession) return state;
        
        const existingIdx = state.activeSession.logs.findIndex(
          (l) => l.exercise_id === logData.exercise_id && l.set_number === logData.set_number
        );

        const newLog: WorkoutLog = {
          ...logData,
          id: existingIdx >= 0 ? state.activeSession.logs[existingIdx].id : Math.random().toString(36).substring(2, 15),
          date_completed: new Date().toISOString(),
          sync_status: 'pending',
        };

        const updatedLogs = [...state.activeSession.logs];
        if (existingIdx >= 0) {
          updatedLogs[existingIdx] = newLog;
        } else {
          updatedLogs.push(newLog);
        }

        return {
          activeSession: {
            ...state.activeSession,
            logs: updatedLogs,
          },
          offlineQueue: [...state.offlineQueue, newLog],
        };
      }),
      removeSet: (exerciseId, setNumber) => set((state) => {
        if (!state.activeSession) return state;
        return {
          activeSession: {
            ...state.activeSession,
            logs: state.activeSession.logs.filter(
              (l) => !(l.exercise_id === exerciseId && l.set_number === setNumber)
            ),
          },
        };
      }),
      finishSession: async (completedAt) => {
        const state = get();
        const session = state.activeSession;
        if (!session) return;

        const db = getDb();
        const userId = useUserStore.getState().id || 'demo-user-uuid-0000-0000';

        try {
          // 1. Save session to SQLite
          await db.runAsync(
            `INSERT INTO workout_sessions (id, user_id, routine_id, started_at, completed_at, sync_status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            session.id,
            userId,
            session.routine_id,
            session.started_at,
            completedAt
          );

          // 2. Save individual logs to SQLite
          for (const log of session.logs) {
            await db.runAsync(
              `INSERT INTO logs (id, session_id, exercise_id, set_number, weight_lifted, reps, date_completed, client_uuid, sync_status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
              log.id,
              session.id,
              log.exercise_id,
              log.set_number,
              log.weight_lifted,
              log.reps,
              log.date_completed,
              log.id
            );
          }
          console.log('[useWorkoutStore] Session and logs saved to SQLite successfully.');
        } catch (sqliteErr) {
          console.error('[useWorkoutStore] SQLite workout save error:', sqliteErr);
        }

        // 3. Sync to Supabase if credentials are configured
        const isKeysConfigured =
          !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
          !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
          !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

        const userSession = useUserStore.getState().session;
        if (isKeysConfigured && userSession?.user?.id) {
          try {
            // Sync session
            const { error: sessionErr } = await supabase
              .from('workout_sessions')
              .upsert({
                id: session.id,
                user_id: userSession.user.id,
                routine_id: session.routine_id,
                started_at: session.started_at,
                completed_at: completedAt,
                sync_status: 'synced',
              });

            if (sessionErr) throw sessionErr;

            // Sync logs
            if (session.logs.length > 0) {
              const supabaseLogs = session.logs.map((log: WorkoutLog) => ({
                id: log.id,
                session_id: session.id,
                exercise_id: log.exercise_id,
                set_number: log.set_number,
                weight_lifted: log.weight_lifted,
                reps: log.reps,
                date_completed: log.date_completed,
                client_uuid: log.id,
              }));

              const { error: logsErr } = await supabase
                .from('logs')
                .upsert(supabaseLogs);

              if (logsErr) throw logsErr;
            }

            // Update SQLite status
            await db.runAsync(
              `UPDATE workout_sessions SET sync_status = 'synced' WHERE id = ?`,
              session.id
            );
            await db.runAsync(
              `UPDATE logs SET sync_status = 'synced' WHERE session_id = ?`,
              session.id
            );
            console.log('[useWorkoutStore] Synced completed workout to Supabase.');
          } catch (supabaseErr) {
            console.error('[useWorkoutStore] Supabase workout sync error:', supabaseErr);
          }
        }

        set({ activeSession: null });
      },
      clearQueue: () => set({ offlineQueue: [] }),
      updateExercises: (exercises) => set((state) => {
        if (!state.activeSession) return state;
        return {
          activeSession: {
            ...state.activeSession,
            exercises,
          },
        };
      }),
      setSelectedDayInSession: (day) => set((state) => {
        if (!state.activeSession) return state;
        return {
          activeSession: {
            ...state.activeSession,
            selected_day: day,
          },
        };
      }),
    }),
    {
      name: 'fitforge-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
