import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  query as fbQuery,
  orderByChild,
  equalTo,
  DataSnapshot,
  DatabaseReference,
  Query,
} from "firebase/database";
import { firebaseDb } from "./firebase";

export type UnsubscribeFn = () => void;

export function dbRef(path: string): DatabaseReference {
  return ref(firebaseDb, path);
}

export async function dbGet<T>(path: string): Promise<T | null> {
  const snap = await get(dbRef(path));
  return snap.exists() ? (snap.val() as T) : null;
}

export async function dbSet<T>(path: string, value: T): Promise<void> {
  await set(dbRef(path), value);
}

export async function dbUpdate(path: string, patch: Record<string, any>): Promise<void> {
  await update(dbRef(path), patch);
}

export async function dbRemove(path: string): Promise<void> {
  await remove(dbRef(path));
}

export function dbPushKey(path: string): string {
  return push(dbRef(path)).key as string;
}

export async function dbQueryByChildEquals<T>(
  path: string,
  child: string,
  equals: string
): Promise<Record<string, T> | null> {
  const q: Query = fbQuery(dbRef(path), orderByChild(child), equalTo(equals));
  const snap = await get(q);
  return snap.exists() ? (snap.val() as Record<string, T>) : null;
}

export function dbSubscribeValue<T>(path: string, cb: (value: T | null) => void): UnsubscribeFn {
  const r = dbRef(path);
  const handler = (snap: DataSnapshot) => cb(snap.exists() ? (snap.val() as T) : null);
  onValue(r, handler);
  return () => off(r, "value", handler);
}
