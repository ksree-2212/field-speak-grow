import { useEffect, useCallback } from 'react';
import { get, set, del, keys } from 'idb-keyval';

export interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineData = () => {
  const isOnline = navigator.onLine;

  // Save data offline
  const saveOffline = useCallback(async (key: string, data: any) => {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    try {
      await set(key, offlineData);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(offlineData));
        return true;
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        return false;
      }
    }
  }, []);

  // Load data from offline storage
  const loadOffline = useCallback(async (key: string): Promise<OfflineData | null> => {
    try {
      const data = await get(key);
      return data || null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      // Fallback to localStorage
      try {
        const localData = localStorage.getItem(key);
        return localData ? JSON.parse(localData) : null;
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
        return null;
      }
    }
  }, []);

  // Delete offline data
  const deleteOffline = useCallback(async (key: string) => {
    try {
      await del(key);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to delete offline data:', error);
      return false;
    }
  }, []);

  // Get all offline keys
  const getAllOfflineKeys = useCallback(async (): Promise<string[]> => {
    try {
      const idbKeys = await keys();
      const localKeys = Object.keys(localStorage);
      return [...new Set([...idbKeys.map(k => k.toString()), ...localKeys])];
    } catch (error) {
      console.error('Failed to get offline keys:', error);
      return Object.keys(localStorage);
    }
  }, []);

  // Sync offline data when online
  const syncData = useCallback(async (apiEndpoint: string, method: 'POST' | 'PUT' = 'POST') => {
    if (!isOnline) return { success: false, error: 'Device is offline' };

    try {
      const allKeys = await getAllOfflineKeys();
      const unsyncedData: OfflineData[] = [];

      for (const key of allKeys) {
        const data = await loadOffline(key);
        if (data && !data.synced) {
          unsyncedData.push(data);
        }
      }

      const syncPromises = unsyncedData.map(async (item) => {
        try {
          const response = await fetch(apiEndpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item.data),
          });

          if (response.ok) {
            // Mark as synced
            await saveOffline(item.key, { ...item.data, synced: true });
            return { key: item.key, success: true };
          } else {
            return { key: item.key, success: false, error: 'Sync failed' };
          }
        } catch (error) {
          return { key: item.key, success: false, error: error.message };
        }
      });

      const results = await Promise.all(syncPromises);
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [isOnline, getAllOfflineKeys, loadOffline, saveOffline]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      // Auto-sync logic can be implemented here
      console.log('Device is online - ready to sync data');
    }
  }, [isOnline]);

  return {
    isOnline,
    saveOffline,
    loadOffline,
    deleteOffline,
    getAllOfflineKeys,
    syncData,
  };
};