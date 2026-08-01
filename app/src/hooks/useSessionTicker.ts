import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

// Mounted only by RestScreen: ticks the rest countdown every second and fires
// `onZero` once when it reaches 0 (vibration + caller navigates back to Set).
export function useRestCountdown(onZero: () => void) {
  const onZeroRef = useRef(onZero);
  onZeroRef.current = onZero;

  useEffect(() => {
    const id = setInterval(() => {
      const active = useStore.getState().active;
      if (!active || active.screen !== 'rest') return;
      const reachedZero = useStore.getState().decrementRestTick();
      if (reachedZero) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onZeroRef.current();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
