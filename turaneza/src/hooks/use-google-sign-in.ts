import Constants from 'expo-constants';
import { useEffect } from 'react';


const isExpoGo = Constants.appOwnership === 'expo';

let isConfigured = false;
async function ensureConfigured() {
  if (isConfigured) return;
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
 
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  isConfigured = true;
}


export function useGoogleSignIn(onIdToken: (idToken: string) => void, onError: (message: string) => void) {
  useEffect(() => {
    if (isExpoGo) return;
    ensureConfigured();
  }, []);

  async function promptAsync() {
    if (isExpoGo) {
      onError('Google Sign-In only works in a real build, not Expo Go.');
      return;
    }
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = await import(
      '@react-native-google-signin/google-signin'
    );
    try {
      await ensureConfigured();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (idToken) {
          onIdToken(idToken);
        } else {
          onError('Google did not return an ID token.');
        }
      }
      // response.type === 'cancelled' — user backed out of the account picker, no error to show.
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return;
      onError('Could not sign in with Google.');
    }
  }

  return { isReady: !isExpoGo, promptAsync };
}
