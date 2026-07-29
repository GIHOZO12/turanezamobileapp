import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import colors from '@/constants/colors';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'plots', label: 'Plots', icon: 'real-estate-agent' },
  { name: 'groups', label: 'Groups', icon: 'groups' },
  { name: 'chat', label: 'Chat', icon: 'chat' },
  { name: 'projects', label: 'Projects', icon: 'apartment' },
] as const;

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={colors['surface-container-lowest']}
      indicatorColor={colors['secondary-container']}
      labelStyle={{ selected: { color: colors['on-secondary-container'] } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name={tab.icon} />}
            selectedColor={colors['on-secondary-container']}
          />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
