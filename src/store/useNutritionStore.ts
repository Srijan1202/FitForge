import { create } from 'zustand';
import { getDb } from '../db/sqlite';
import { useUserStore } from './useUserStore';
import { supabase } from '../api/supabase';

export interface NutritionLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  source: 'manual' | 'ai_parsed';
  sync_status: 'pending' | 'synced';
}

interface NutritionState {
  logs: NutritionLog[];
  loading: boolean;
  fetchDailyLogs: (dateStr: string) => Promise<void>;
  addLog: (logData: Omit<NutritionLog, 'id' | 'user_id' | 'sync_status'>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  logs: [],
  loading: false,

  fetchDailyLogs: async (dateStr) => {
    set({ loading: true });
    try {
      const db = getDb();
      const rows = await db.getAllAsync(
        'SELECT * FROM nutrition_logs WHERE log_date = ? ORDER BY id DESC',
        [dateStr]
      ) as NutritionLog[];
      set({ logs: rows, loading: false });
    } catch (err) {
      console.error('[useNutritionStore] SQLite logs load failed:', err);
      set({ logs: [], loading: false });
    }
  },

  addLog: async (logData) => {
    const db = getDb();
    const newId = Math.random().toString(36).substring(2, 15);
    const userId = useUserStore.getState().id || 'demo-user-uuid-0000-0000';

    try {
      // 1. Insert local log in SQLite
      await db.runAsync(
        `INSERT INTO nutrition_logs (
          id, user_id, log_date, description, calories, protein_g, carbs_g, fats_g, source, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');`,
        newId,
        userId,
        logData.log_date,
        logData.description,
        logData.calories,
        logData.protein_g,
        logData.carbs_g,
        logData.fats_g,
        logData.source
      );
      console.log('[useNutritionStore] SQLite logged nutrition row successfully.');
    } catch (sqliteErr) {
      console.error('[useNutritionStore] SQLite insert nutrition error:', sqliteErr);
    }

    // 2. Sync to Supabase if credentials exist
    const isKeysConfigured =
      !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
      !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

    const userSession = useUserStore.getState().session;
    if (isKeysConfigured && userSession?.user?.id) {
      try {
        const { error } = await supabase
          .from('nutrition_logs')
          .upsert({
            id: newId,
            user_id: userSession.user.id,
            date: logData.log_date, // supabase field name is 'date'
            description: logData.description,
            calories: logData.calories,
            protein_g: logData.protein_g,
            carbs_g: logData.carbs_g,
            fats_g: logData.fats_g,
            source: logData.source,
          });

        if (error) {
          console.error('[useNutritionStore] Supabase food sync error:', error);
        } else {
          // Flag as synced locally
          await db.runAsync(
            "UPDATE nutrition_logs SET sync_status = 'synced' WHERE id = ?",
            [newId]
          );
          console.log('[useNutritionStore] Food log synced to Supabase.');
        }
      } catch (supabaseErr) {
        console.error('[useNutritionStore] Supabase network sync error:', supabaseErr);
      }
    }

    // Refresh logs feed
    await get().fetchDailyLogs(logData.log_date);
  },

  deleteLog: async (id) => {
    const db = getDb();
    const activeLogs = get().logs;
    const logToDelete = activeLogs.find((l) => l.id === id);
    if (!logToDelete) return;

    try {
      // 1. Delete from SQLite
      await db.runAsync('DELETE FROM nutrition_logs WHERE id = ?', [id]);
      console.log('[useNutritionStore] SQLite deleted food log.');
    } catch (sqliteErr) {
      console.error('[useNutritionStore] SQLite delete error:', sqliteErr);
    }

    // 2. Sync delete to Supabase if configured
    const isKeysConfigured =
      !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
      !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

    const userSession = useUserStore.getState().session;
    if (isKeysConfigured && userSession?.user?.id) {
      try {
        const { error } = await supabase
          .from('nutrition_logs')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[useNutritionStore] Supabase delete sync error:', error);
        } else {
          console.log('[useNutritionStore] Supabase delete sync completed.');
        }
      } catch (supabaseErr) {
        console.error('[useNutritionStore] Supabase delete network fault:', supabaseErr);
      }
    }

    // Refresh logs feed
    await get().fetchDailyLogs(logToDelete.log_date);
  },
}));
