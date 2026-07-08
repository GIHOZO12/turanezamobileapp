// On web there's no native splash screen to dismiss, so this is a no-op — the real
// implementation lives in animated-icon.tsx and is used on iOS/Android.
export function AnimatedSplashOverlay() {
  return null;
}
