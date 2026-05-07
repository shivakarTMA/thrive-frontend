import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import rootReducer from "./Reducers/rootReducer";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { createLogger } from "redux-logger";

const loggerMiddleware = createLogger({
  predicate: (getState, action) =>
    !action.type.startsWith("persist/"),
});

const persistConfig = {
  key: "thrive",
  storage: storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(loggerMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
