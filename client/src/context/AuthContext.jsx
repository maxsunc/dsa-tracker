import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api, { injectTokenRef } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef(null);

  // Inject the token ref into the API module
  useEffect(() => {
    injectTokenRef(accessTokenRef);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        accessTokenRef.current = data.accessToken;

        const meResponse = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setUser(meResponse.data.user);
      } catch {
        // No valid refresh token — not logged in
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback((token, userData) => {
    setAccessToken(token);
    accessTokenRef.current = token;
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors
    }
    setAccessToken(null);
    accessTokenRef.current = null;
    setUser(null);
  }, []);

  const value = {
    user,
    accessToken,
    setAccessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
