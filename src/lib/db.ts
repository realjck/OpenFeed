import { openDB, type IDBPDatabase } from 'idb';
import { type Feed, type Settings, DEFAULT_SETTINGS } from '../types';

const DB_NAME = 'openfeed';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('feeds')) {
        db.createObjectStore('feeds', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });

  return dbInstance;
}

export async function getFeeds(): Promise<Feed[]> {
  return (await getDB()).getAll('feeds');
}

export async function saveFeed(feed: Feed): Promise<void> {
  await (await getDB()).put('feeds', feed);
}

export async function deleteFeed(id: string): Promise<void> {
  await (await getDB()).delete('feeds', id);
}

export async function getSettings(): Promise<Settings> {
  return (await (await getDB()).get('settings', 'default')) ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await (await getDB()).put('settings', settings, 'default');
}
