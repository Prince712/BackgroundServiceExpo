import BackgroundFetch from 'react-native-background-fetch';
import { store } from '../store';
import { updateLastTriggered } from '../store/slices/backgroundServiceSlice';
import { playSound } from './backgroundService';


const BACKGROUND_TASK = "background-fetch";

async function backgroundTask(BACKGROUND_TASK : String) {
    console.log("[BackgroundFetch] Background Task Running!");
    
    const state = store.getState().backgroundService;
    if (state.isEnabled) {
        await playSound();
    }

    store.dispatch(updateLastTriggered());
    return 'new_data';
}

export async function initBackgroundFetch() {
    console.log("Initializing Background Fetch...");
    const status = await BackgroundFetch.configure(
        {
            minimumFetchInterval: 15, // Android limit (min 15 min interval)
            stopOnTerminate: false,  // 🔹 Continue after app is killed
            startOnBoot: true,       // 🔹 Restart after device reboot
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
        },
        backgroundTask,
        (error: any) => {
            console.error("[BackgroundFetch] Error:", error);
        }
    );

    console.log("[BackgroundFetch] Configured with status:", status);
}
