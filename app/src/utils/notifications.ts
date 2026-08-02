import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show the alert even when the app is in the foreground — on iOS this is what
// makes a paired Apple Watch relay the notification and buzz the wrist.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionGranted: boolean | null = null;
let restNotificationId: string | null = null;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (permissionGranted !== null) return permissionGranted;
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      const asked = await Notifications.requestPermissionsAsync();
      granted = asked.granted;
    }
    if (granted && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('rest', {
        name: 'Fin de repos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 220, 90, 220],
        sound: 'default',
      });
    }
    permissionGranted = granted;
    return granted;
  } catch {
    permissionGranted = false;
    return false;
  }
}

/**
 * Schedule the "rest over" alert `seconds` from now, replacing any pending one.
 * Fires even if the phone is locked or the app is backgrounded, which is the
 * whole point — the wrist buzz has to arrive without looking at the phone.
 */
export async function scheduleRestEnd(seconds: number, subtitle: string): Promise<void> {
  await cancelRestEnd();
  if (seconds <= 0) return;
  if (!(await ensureNotificationPermission())) return;
  try {
    restNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Repos terminé',
        body: subtitle,
        sound: 'default',
        interruptionLevel: 'timeSensitive',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: Platform.OS === 'android' ? 'rest' : undefined,
      },
    });
  } catch {
    restNotificationId = null;
  }
}

export async function cancelRestEnd(): Promise<void> {
  if (!restNotificationId) return;
  const id = restNotificationId;
  restNotificationId = null;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or dismissed — nothing to cancel.
  }
}
