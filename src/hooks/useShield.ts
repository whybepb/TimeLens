import { useState, useEffect, useCallback } from "react";
import { getShieldService } from "../services/ShieldService";

export interface UseShieldReturn {
  isActive: boolean;
  currentApp: string | null;
  isEnabled: boolean;
  proceed: () => void;
  returnToFocus: () => void;
  setEnabled: (enabled: boolean) => void;
  demoTrigger: (appName?: string) => void;
}

/**
 * Hook to manage the Focus Shield overlay
 * Provides state and actions for the shield system
 */
export function useShield(): UseShieldReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [isEnabled, setIsEnabledState] = useState(true);

  useEffect(() => {
    const shieldService = getShieldService();
    
    // Sync initial enabled state
    setIsEnabledState(shieldService.isEnabled());

    // Subscribe to shield state changes
    const unsubscribe = shieldService.subscribe((active, appName) => {
      setIsActive(active);
      setCurrentApp(appName);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const proceed = useCallback(() => {
    getShieldService().proceedToApp();
  }, []);

  const returnToFocus = useCallback(() => {
    getShieldService().returnToFocus();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    getShieldService().setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  const demoTrigger = useCallback((appName?: string) => {
    getShieldService().demoTrigger(appName);
  }, []);

  return {
    isActive,
    currentApp,
    isEnabled,
    proceed,
    returnToFocus,
    setEnabled,
    demoTrigger,
  };
}

export default useShield;
