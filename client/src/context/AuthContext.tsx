import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authService, RegisterInput, userService } from '../services/authService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (values: RegisterInput, avatar?: File | null) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Session persistence: the HTTP-only cookie is the source of truth, so ask the server who we are.
  useEffect(() => {
    authService
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    qc.clear();
  }, [qc]);

  useEffect(() => {
    const onExpired = () => {
      clearSession();
      toast.error('Your session has expired. Please log in again.');
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [clearSession]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      setUser,
      login: async (email, password) => setUser(await authService.login({ email, password })),
      register: async (values, avatar) => {
        setUser(await authService.register(values));
        if (avatar) {
          try {
            setUser(await userService.uploadAvatar(avatar));
          } catch {
            toast.error('Your account was created, but the profile image could not be uploaded.');
          }
        }
      },
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          clearSession();
        }
      },
    }),
    [user, loading, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
