import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loginUser, registerUser } from '../api/auth';
import { getTokens, setTokens, clearTokens } from '../utils/storage';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getTokens() !== null
  );

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await loginUser(username, password);
    setTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    await registerUser(username, password);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, login, register, logout }),
    [isAuthenticated, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
