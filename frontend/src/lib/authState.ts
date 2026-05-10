'use client';

import { useMemo, useSyncExternalStore } from 'react';

export interface StoredUser {
  id?: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  email?: string;
}

const USER_STORAGE_KEY = 'user';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('bossfinance-auth', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('bossfinance-auth', onStoreChange);
  };
}

function getSnapshot() {
  return localStorage.getItem(USER_STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

export function useStoredUser() {
  const userJson = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo<StoredUser | null>(() => {
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as StoredUser;
    } catch {
      return null;
    }
  }, [userJson]);
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event('bossfinance-auth'));
}
