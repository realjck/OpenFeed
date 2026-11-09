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

Object.assign(globalThis, {
  indexedDB: new IDBFactory(),
  IDBKeyRange,
  IDBRequest,
  IDBOpenDBRequest,
  IDBDatabase,
  IDBObjectStore,
  IDBIndex,
  IDBCursor,
  IDBCursorWithValue,
  IDBTransaction,
});
