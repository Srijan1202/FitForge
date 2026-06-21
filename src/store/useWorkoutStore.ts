import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutLog {
  id: string; // client uuid
  exercise_id: string;
  set_number: number;
  weight_lifted: number;
  reps: number;
  date_completed: string;
  sync_status: 'pending' | 'synced';
}

export interface ActiveSession {
  id: string;
  routine_id: string | null;
  started_at: string;
  logs: WorkoutLog[];
}

interface WorkoutState {
  activeSession: ActiveSession | null;
  offlineQueue: WorkoutLog[];
  startSession: (routineId?: string) => void;
  logSet: (log: Omit<WorkoutLog, 'id' | 'date_completed' | 'sync_status'>) => void;
  finishSession: () => void;
  clearQueue: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeSession: null,
      offlineQueue: [],
      startSession: (routineId) => set({
        activeSession: {
          id: Date.now().toString(), // Simple client UUID, in reality use a real UUID
          routine_id: routineId || null,
          started_at: new Date().toISOString(),
          logs: [],
        }
      }),
      logSet: (logData) => set((state) => {
        if (!state.activeSession) return state;
        
        const newLog: WorkoutLog = {
          ...logData,
          id: Math.random().toString(36).substring(2, 15),
          date_completed: new Date().toISOString(),
          sync_status: 'pending',
        };

        return {
          activeSession: {
            ...state.activeSession,
            logs: [...state.activeSession.logs, newLog],
          },
          // Add to offline queue to be synced to SQLite / Supabase later
          offlineQueue: [...state.offlineQueue, newLog],
        };
      }),
      finishSession: () => set({ activeSession: null }),
      clearQueue: () => set({ offlineQueue: [] }),
    }),
    {
      name: 'fitforge-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
