// import { MaterialIcons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { Pressable } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import colors from '@/constants/colors';
// import { useAuth } from '@/contexts/auth-context';


// export function AiAssistantFab() {
//   const { isSignedIn } = useAuth();
//   const insets = useSafeAreaInsets();
//   const router = useRouter();

//   if (!isSignedIn) return null;

//   return (
//     <Pressable
//       onPress={() => router.push('/assistant')}
//       hitSlop={8}
//       style={{ bottom: insets.bottom + 88 }}
//       className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-investment active:opacity-90">
//       <MaterialIcons name="smart-toy" size={26} color={colors['on-primary']} />
//     </Pressable>
//   );
// }
