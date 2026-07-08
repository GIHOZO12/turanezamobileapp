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
  /** Call after verify-email succeeds — the backend has already created a session by then. */
  completeSession: () => Promise<void>;
  signOut: () => void;
};

/**
 * Two things establish "signed in" here, for two different purposes:
 *  - The session cookie (set by /login/, /verify/, etc.) is what GET requests ride on, including
 *    the bootstrap /me/ check below — RN's networking layer persists and resends it automatically,
 *    so auth genuinely survives app restarts without us reading anything from storage for this part.
 *  - The JWT access token (obtained via login() below, stored through api/token-store.ts) is what
 *    mutations ride on, since Django's CSRF protection blocks session-cookie-authenticated POSTs
 *    and RN can't satisfy it (see api/client.ts's comment for why). It's fetched best-effort: if
 *    the backend's /token/ endpoint doesn't exist yet, login still succeeds on the session alone —
 *    browsing works, mutations won't until that endpoint is added.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    // Prime the in-memory token cache from SecureStore before the first request goes out —
    // apiFetch reads the cache synchronously and can't await this itself.
    loadAccessToken().finally(() => {
      authApi
        .fetchMe()
        .then((me) => {
          setUser(me);
          setIsSignedIn(true);
        })
        .catch(() => {
          // No valid session cookie yet (401), or the backend is unreachable — either way,
          // treat it as signed out rather than surfacing an error on a screen the user hasn't seen.
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
        await authApi.login({ email, password });
        const me = await authApi.fetchMe();
        setUser(me);
        setIsSignedIn(true);

        try {
          const tokens = await authApi.fetchMobileToken({ email, password });
          await setTokens(tokens.access, tokens.refresh);
        } catch {
          // /token/ isn't on the backend yet (see api/auth.ts) — sign-in still succeeds on the
          // session cookie alone, mutations just won't work until that endpoint exists.
        }
      },
      completeSession: async () => {
        // No password available here (verify-email only has the code, not the password) so this
        // can't also fetch a JWT the way login() does — the user gets one the next time they sign
        // in normally. Browsing/viewing works immediately either way; only mutations are gated.
        const me = await authApi.fetchMe();
        setUser(me);
        setIsSignedIn(true);
      },
      signOut: () => {
        // Local-only for now: clears app state and the stored JWT, but leaves the sessionid
        // cookie alive server-side. Now that mutations go through the JWT (not the session), the
        // real POST /logout/ could be called here without hitting CSRF — deferred until Profile
        // Settings actually needs a sign-out button.
        clearTokens();
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
