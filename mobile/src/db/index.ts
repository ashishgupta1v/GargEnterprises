/**
 * WatermelonDB Database Instance with Dynamic Fallback
 * 
 * Auto-detects if native modules are available (like in custom dev builds).
 * If not (running inside standard Expo Go), it gracefully falls back to LokiJS 
 * (in-memory/JS storage) to prevent the application from crashing.
 */
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { NativeModules } from 'react-native';
import schema from './schema';

let adapter;

// Detect presence of native WatermelonDB bridge
const isNativeAvailable = !!NativeModules.WMDatabaseBridge;

if (isNativeAvailable) {
  adapter = new SQLiteAdapter({
    schema,
    dbName: 'garg_enterprises_db',
    jsi: false, // Fallback to NativeBridge for maximum compatibility
    onSetUpError: (error) => {
      console.error('WatermelonDB SQLite setup error:', error);
    },
  });
} else {
  console.warn(
    '⚠️ WatermelonDB Native Module (WMDatabaseBridge) not found.\n' +
    'Falling back to LokiJS (In-Memory JS database) for Expo Go compatibility.\n' +
    'To use persistent native SQLite, compile a custom development build (npx expo run:android).'
  );
  adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false, // React Native does not support Web Workers natively
    useIncrementalIndexedDB: false, // IndexedDB is not supported on React Native
  });
}

export const database = new Database({
  adapter,
  modelClasses: [], // Add model classes here when defined
});

export default database;
