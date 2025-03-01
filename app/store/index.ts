import { configureStore,} from "@reduxjs/toolkit";
import backgroundServiceReducer,{BackgroundServiceState} from "./slices/backgroundServiceSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";

// Redux Persist Configuration
const persistConfig: PersistConfig<BackgroundServiceState> = {
  key: "backgroundService",
  storage: AsyncStorage,
};

// Apply persistReducer with TypeScript support
const persistedReducer = persistReducer<BackgroundServiceState,any>(
  persistConfig,
  backgroundServiceReducer
);

// Create Redux Store
export const store = configureStore({
  reducer: {
    backgroundService: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // used for Ignoring non-serializable warnings
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
