import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { store } from '../store';
import { updateLastTriggered } from '../store/slices/backgroundServiceSlice';

const BACKGROUND_FETCH_TASK = 'background-fetch';
let sound: Audio.Sound | null = null;

export async function configureAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true, // ✅ Allows background playback
      playsInSilentModeIOS: true,    // ✅ Plays even in silent mode
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
    console.log("Audio mode configured.");
  } catch (error) {
    console.error("Error configuring audio mode:", error);
  }
}

export async function playSound() {
  console.warn("Playing sound");
  console.log("Playing sound....");

  try {
    await configureAudio(); // ✅ Ensure audio is configured before playing

    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../../assets/alert.mp3'),
      { shouldPlay: true }
    );
    sound = newSound;
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Only define the background task if we're not on web
if (Platform.OS !== 'web') {
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const state = store.getState().backgroundService;
    if (!state.isEnabled) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    console.log("Background Task initiated");

    try {
      if (Platform.OS === 'ios') {
        await sendNotification(); // ✅ Uses notification on iOS for background alert
      } else {
        await playSound();
      }
      store.dispatch(updateLastTriggered());
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error('Background task error:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function sendNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Alert',
      body: 'Background service alert',
      sound: 'default', // ✅ Ensures a sound is played
    },
    trigger: null,
  });
}

export async function registerBackgroundFetch() {
  if (Platform.OS === 'web') {
    console.log('Background fetch is not supported on web');
    return;
  }

  try {
    console.log("Registering background fetch...");
    return await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 120, // ✅ Runs every 2 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Task registration failed:', error);
  }
}

export async function unregisterBackgroundFetch() {
  if (Platform.OS === 'web') {
    console.log('Background fetch is not supported on web');
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    console.log(`Is task registered? ${isRegistered}`);

    if (!isRegistered) {
      console.warn('Task is not registered, skipping unregistration');
      return;
    }
    return await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  } catch (error) {
    console.error('Task unregistration failed:', error);
  }
}

export async function setupNotifications() {
  if (Platform.OS === 'web') {
    console.log('Notifications are not supported on web');
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }
  }

  if (Platform.OS === 'ios') {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
}
