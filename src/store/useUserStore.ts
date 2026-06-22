import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';
import { getDb } from '../db/sqlite';

export type FitnessGoal = 'bulk' | 'cut' | 'maintain' | 'general';

export interface UserProfile {
  id?: string;
  name: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  fitness_goal: FitnessGoal;
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  isOnboarded: boolean;
  hostel?: string;
  mess?: string;
}

interface UserState extends UserProfile {
  session: Session | null;
  loading: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const initialState: UserProfile = {
  name: '',
  age: null,
  weight_kg: null,
  height_cm: null,
  fitness_goal: 'general',
  daily_calories: 2000,
  daily_protein_g: 150,
  daily_carbs_g: 200,
  daily_fats_g: 65,
  isOnboarded: false,
  hostel: '1',
  mess: '1',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      session: null,
      loading: true,
      updateProfile: (profile) => set((state) => ({ ...state, ...profile })),
      completeOnboarding: () => set({ isOnboarded: true }),
      resetProfile: () => set(initialState),
      setSession: (session) => set({ session, id: session?.user?.id }),
      setLoading: (loading) => set({ loading }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ ...initialState, session: null, id: undefined });
      },
      saveProfile: async (profile) => {
        // 1. Update local Zustand state first
        set((state) => ({ ...state, ...profile }));

        const state = get();
        const userId = state.id || 'demo-user-uuid-0000-0000';

        // 2. Persist to SQLite database
        try {
          const db = getDb();
          await db.runAsync(
            `INSERT OR REPLACE INTO users (
              id, name, age, weight_kg, height_cm, fitness_goal, 
              daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g,
              hostel, mess
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            userId,
            state.name || '',
            state.age,
            state.weight_kg,
            state.height_cm,
            state.fitness_goal,
            state.daily_calories,
            state.daily_protein_g,
            state.daily_carbs_g,
            state.daily_fats_g,
            state.hostel || '1',
            state.mess || '1'
          );
          console.log('[useUserStore] Profile saved to SQLite successfully.');
        } catch (sqliteErr) {
          console.error('[useUserStore] SQLite profile save error:', sqliteErr);
        }

        // 3. Sync to Supabase if credentials are configured
        const isKeysConfigured =
          !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
          !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
          !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

        if (isKeysConfigured && state.session?.user?.id) {
          try {
            const { error } = await supabase
              .from('users')
              .upsert({
                id: state.session.user.id,
                name: state.name || '',
                age: state.age,
                weight_kg: state.weight_kg,
                height_cm: state.height_cm,
                fitness_goal: state.fitness_goal,
                daily_calories: state.daily_calories,
                daily_protein_g: state.daily_protein_g,
                daily_carbs_g: state.daily_carbs_g,
                daily_fats_g: state.daily_fats_g,
                hostel: state.hostel,
                mess: state.mess,
              });

            if (error) {
              console.error('[useUserStore] Supabase profile sync error:', error);
            } else {
              console.log('[useUserStore] Profile synced to Supabase successfully.');
            }
          } catch (supabaseErr) {
            console.error('[useUserStore] Supabase network/auth error:', supabaseErr);
          }
        }
      },
    }),
    {
      name: 'fitforge-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        name: state.name,
        age: state.age,
        weight_kg: state.weight_kg,
        height_cm: state.height_cm,
        fitness_goal: state.fitness_goal,
        daily_calories: state.daily_calories,
        daily_protein_g: state.daily_protein_g,
        daily_carbs_g: state.daily_carbs_g,
        daily_fats_g: state.daily_fats_g,
        isOnboarded: state.isOnboarded,
        session: state.session,
        id: state.id,
        hostel: state.hostel,
        mess: state.mess,
      }),
    }
  )
);
