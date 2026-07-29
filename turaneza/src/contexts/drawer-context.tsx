import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type DrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * Global so TopAppBar (used on Home/Plots/Groups/Profile) can open the drawer directly without
 * every screen having to thread an onMenuPress prop down to it, and so the drawer overlay itself
 * can render once at the root — above the tab bar — instead of being duplicated per screen.
 */
export function DrawerProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<DrawerContextValue>(
    () => ({ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }),
    [isOpen]
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within a DrawerProvider');
  return ctx;
}
