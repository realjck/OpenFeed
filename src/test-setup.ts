import '@testing-library/jest-dom';
import {
  IDBFactory,
  IDBKeyRange,
  IDBRequest,
  IDBOpenDBRequest,
  IDBDatabase,
  IDBObjectStore,
  IDBIndex,
  IDBCursor,
  IDBCursorWithValue,
  IDBTransaction,
} from 'fake-indexeddb';

(global as any).indexedDB = new IDBFactory();
(global as any).IDBKeyRange = IDBKeyRange;
(global as any).IDBRequest = IDBRequest;
(global as any).IDBOpenDBRequest = IDBOpenDBRequest;
(global as any).IDBDatabase = IDBDatabase;
(global as any).IDBObjectStore = IDBObjectStore;
(global as any).IDBIndex = IDBIndex;
(global as any).IDBCursor = IDBCursor;
(global as any).IDBCursorWithValue = IDBCursorWithValue;
(global as any).IDBTransaction = IDBTransaction;
