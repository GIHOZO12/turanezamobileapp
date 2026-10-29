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
  /**
   * Call after verify-email succeeds. Verification only logs the user into a Django
   * *session*, but every other endpoint authenticates with a JWT Bearer token — so we
   * mint one here from the password stashed at signup. Returns 'needs-sign-in' when
   * that password is gone (app restarted between signup and verification).
   */
  completeSession: (email: string) => Promise<'signed-in' | 'needs-sign-in'>;
  signOut: () => Promise<void>;
};


/**
 * Kept in memory only — never persisted, never put in route params — so the
 * verify-email step can exchange it for JWTs. Cleared as soon as it is used.
 */
let pendingSignupPassword: string | null = null;

/** Called by the sign-up screen just before it navigates to verify-email. */
export function stashSignupPassword(password: string) {
  pendingSignupPassword = password;
}

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
      completeSession: async (email) => {
        const password = pendingSignupPassword;
        pendingSignupPassword = null;
        if (!password) return 'needs-sign-in';

        const tokens = await authApi.fetchMobileToken({ email, password });
        await setTokens(tokens.access, tokens.refresh);

        const me = await authApi.fetchMe();
        setUser(me);
        setIsSignedIn(true);
        return 'signed-in';
      },
      signOut: async () => {
        
        try {
          await authApi.logout();
        } catch {
          // Ignored — see above.
        }
        await clearTokens();
        pendingSignupPassword = null;
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
