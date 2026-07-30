import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import * as authApi from '@/api/auth';
import type { UserMe } from '@/api/auth';
import { clearTokens, loadAccessToken, setTokens } from '@/api/token-store';

type AuthContextValue = {
  isSignedIn: boolean;
  /** True until the initial /me/ bootstrap check resolves — gates the first route decision. */
  isBootstrapping: boolean;
  user: UserMe | null;
  login: (email: string, password: string) => Promise<void>;
  /** Exchanges a Google ID token (from the native Google Sign-In flow) for our own JWTs. */
  signInWithGoogle: (idToken: string) => Promise<void>;
  /** Call after verify-email succeeds — the backend has already created a session by then. */
  completeSession: () => Promise<void>;
  signOut: () => Promise<void>;
};


const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    
    loadAccessToken().finally(() => {
      authApi
        .fetchMe()
        .then((me) => {
          setUser(me);
          setIsSignedIn(true);
        })
        .catch(() => {
          
          setIsSignedIn(false);
        })
        .finally(() => setIsBootstrapping(false));
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isSignedIn,
      isBootstrapping,
      user,
      login: async (email, password) => {
   
        const tokens = await authApi.fetchMobileToken({ email, password });
        await setTokens(tokens.access, tokens.refresh);

        const me = await authApi.fetchMe();
        setUser(me);
        setIsSignedIn(true);

     
        authApi.login({ email, password }).catch(() => {});
      },
      signInWithGoogle: async (idToken) => {
        const tokens = await authApi.googleAuth({ credential: idToken });
        await setTokens(tokens.access, tokens.refresh);

        const me = await authApi.fetchMe();
        setUser(me);
        setIsSignedIn(true);
      },
      completeSession: async () => {
        const me = await authApi.fetchMe();
        setUser(me);
        setIsSignedIn(true);
      },
      signOut: async () => {
        
        try {
          await authApi.logout();
        } catch {
          // Ignored — see above.
        }
        await clearTokens();
        setUser(null);
        setIsSignedIn(false);
      },
    }),
    [isSignedIn, isBootstrapping, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
