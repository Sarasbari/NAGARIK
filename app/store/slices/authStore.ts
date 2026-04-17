import { create } from 'zustand';
import { supabase } from '../../core/services/supabase';

interface AuthState {
  user: any | null;
  phone: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  setPhone: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  phone: '',
  isLoading: false,
  isAuthenticated: false,

  setPhone: (phone) => set({ phone }),

  sendOTP: async (phone) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone, otp) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
