import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn(onIdToken: (idToken: string) => void, onError: (message: string) => void) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

 
  const onIdTokenRef = useRef(onIdToken);
  const onErrorRef = useRef(onError);
  onIdTokenRef.current = onIdToken;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        onIdTokenRef.current(idToken);
      } else {
        onErrorRef.current('Google did not return an ID token.');
      }
    } else if (response.type === 'error') {
      onErrorRef.current(response.error?.message ?? 'Google sign-in failed.');
    }
  }, [response]);

  return { isReady: !!request, promptAsync };
}
