import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

import colors from '@/constants/colors';

const TABS = [
  { name: 'home', href: '/', label: 'Home', icon: 'home' },
  { name: 'plots', href: '/plots', label: 'Plots', icon: 'real-estate-agent' },
  { name: 'groups', href: '/groups', label: 'Groups', icon: 'groups' },
  { name: 'chat', href: '/chat', label: 'Chat', icon: 'chat' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'person' },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: keyof typeof MaterialIcons.glyphMap };

export function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} className="active:opacity-70">
      <View
        className={
          isFocused
            ? 'items-center gap-0.5 rounded-full bg-secondary-container px-4 py-1'
            : 'items-center gap-0.5 rounded-full px-4 py-1'
        }>
        <MaterialIcons name={icon} size={22} color={isFocused ? colors['on-secondary-container'] : colors['on-surface-variant']} />
        <Text
          className={
            isFocused
              ? 'font-label-sm text-label-sm text-on-secondary-container'
              : 'font-label-sm text-label-sm text-on-surface-variant'
          }>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} className="absolute bottom-0 w-full flex-row items-center justify-around bg-surface-container-lowest px-2 py-3 shadow-investment">
      {props.children}
    </View>
  );
}
