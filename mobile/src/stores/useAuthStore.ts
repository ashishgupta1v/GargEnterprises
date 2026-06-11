/**
 * Auth Store — Zustand
 *
 * Manages authentication state: JWT token, user info, role,
 * login/logout actions, and token refresh.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface User {
  id: number;
  name: string;
  phone: string;
  role: 'owner' | 'manager' | 'staff' | 'godown';
  status: 'active' | 'inactive';
}

interface AuthState {
  // State
  accessToken: string | null;
  user: User | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  sendOtp: (phone: string, role: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string, role: string, deviceFingerprint: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;

  // Role checks
  isOwner: () => boolean;
  isManager: () => boolean;
  canSubmitMovements: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      accessToken: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // ── Send OTP ──
      sendOtp: async (phone, role) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/send-otp', { phone, role: role.toLowerCase() });
          set({ isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.error?.message || 'Failed to send OTP. Please try again.';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      // ── Verify OTP & Login ──
      verifyOtp: async (phone, otp, role, deviceFingerprint) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/auth/verify-otp', {
            phone,
            otp,
            role: role.toLowerCase(),
            device_fingerprint: deviceFingerprint,
          });
          
          if (response.data.success) {
            const { access_token, user, expires_at } = response.data.data;

            // Set API auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            set({
              accessToken: access_token,
              user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                status: user.status,
              },
              expiresAt: expires_at,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.error?.message || 'Verification failed.');
          }
        } catch (error: any) {
          const message = error.response?.data?.error?.message || error.message || 'Verification failed. Please try again.';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          throw new Error(message);
        }
      },

      // ── Logout ──
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Logout even if API call fails
        } finally {
          api.defaults.headers.common['Authorization'] = '';
          set({
            accessToken: null,
            user: null,
            expiresAt: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // ── Token Refresh ──
      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh');

          if (response.data.success) {
            const { access_token, expires_at } = response.data.data;
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            set({
              accessToken: access_token,
              expiresAt: expires_at,
            });
          }
        } catch {
          // Force logout on refresh failure
          get().logout();
        }
      },

      clearError: () => set({ error: null }),

      // ── Role Checks ──
      isOwner: () => get().user?.role === 'owner',
      isManager: () => get().user?.role === 'manager',
      canSubmitMovements: () => {
        const role = get().user?.role;
        return role === 'owner' || role === 'manager' || role === 'godown';
      },
    }),
    {
      name: 'ge-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-inject auth header after rehydration
        if (state?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
        }
        useAuthStore.getState().setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
