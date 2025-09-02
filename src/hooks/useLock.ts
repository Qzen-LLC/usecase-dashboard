import { useState, useEffect, useCallback } from 'react';

export interface LockInfo {
  hasExclusiveLock: boolean;
  exclusiveLockDetails?: {
    type: string;
    acquiredBy: string;
    acquiredAt: string;
    expiresAt: string;
  };
  canEdit?: boolean;
  message?: string;
  error?: string;
}

export interface UseLockReturn {
  lockInfo: LockInfo | null;
  isLocked: boolean;
  isExclusiveLocked: boolean;
  isSharedLocked: boolean;
  acquireExclusiveLock: () => Promise<boolean>;
  releaseLock: (lockType: 'SHARED' | 'EXCLUSIVE') => Promise<void>;
  refreshLockStatus: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useLock = (useCaseId: string, scope: 'ASSESS' | 'EDIT' = 'ASSESS'): UseLockReturn => {
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = lockInfo?.hasExclusiveLock || false;
  const isExclusiveLocked = lockInfo?.hasExclusiveLock || false;
  const isSharedLocked = false; // No more shared locks in this implementation

  const refreshLockStatus = useCallback(async () => {
    if (!useCaseId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/get-usecase-details?useCaseId=${useCaseId}&acquireSharedLock=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch lock status');
      }
      const data = await response.json();
      setLockInfo((prev) => {
        const incoming: LockInfo | null = data.lockInfo || null;
        if (!incoming) return null;
        // Preserve canEdit if we already own the lock
        const mergedCanEdit = prev?.canEdit === true ? true : (incoming.canEdit ?? false);
        return { ...incoming, canEdit: mergedCanEdit };
      });
    } catch (err) {
      console.error('Error refreshing lock status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh lock status');
    } finally {
      setLoading(false);
    }
  }, [useCaseId]);

  const acquireExclusiveLock = useCallback(async (): Promise<boolean> => {
    if (!useCaseId) return false;
    if (lockInfo?.hasExclusiveLock) {
      console.log('Already have exclusive lock, skipping acquisition');
      return true;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/locks/acquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE', scope })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setLockInfo({ hasExclusiveLock: true, exclusiveLockDetails: data.lockDetails, canEdit: false });
          return false;
        }
        throw new Error(data.error || 'Failed to acquire exclusive lock');
      }
      setLockInfo({ hasExclusiveLock: true, canEdit: true });
      return true;
    } catch (err) {
      console.error('Error acquiring exclusive lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to acquire exclusive lock');
      return false;
    } finally {
      setLoading(false);
    }
  }, [useCaseId, lockInfo?.hasExclusiveLock, scope]);

  const releaseLock = useCallback(async (lockType: 'SHARED' | 'EXCLUSIVE'): Promise<void> => {
    if (!useCaseId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/locks/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, lockType, scope })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to release lock');
      }
      await refreshLockStatus();
    } catch (err) {
      console.error('Error releasing lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to release lock');
    } finally {
      setLoading(false);
    }
  }, [useCaseId, refreshLockStatus, scope]);

  useEffect(() => {
    if (useCaseId) {
      refreshLockStatus();
    }
  }, [useCaseId, refreshLockStatus]);

  useEffect(() => {
    if (!useCaseId) return;
    const interval = setInterval(() => { refreshLockStatus(); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [useCaseId, refreshLockStatus]);

  useEffect(() => {
    if (!useCaseId || !lockInfo?.hasExclusiveLock) return;
    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/locks/release', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE', scope }),
        });
        setLockInfo(prev => prev ? { ...prev, hasExclusiveLock: false } : null);
      } catch (error) {
        console.error('Failed to auto-release lock:', error);
      }
    }, 30 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [useCaseId, lockInfo?.hasExclusiveLock, scope]);

  useEffect(() => {
    if (!useCaseId) return;
    const handleBeforeUnload = async () => {
      if (lockInfo?.hasExclusiveLock) {
        try {
          await fetch('/api/locks/release', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE', scope }), keepalive: true
          });
        } catch (error) {
          console.error('Failed to release lock on page unload:', error);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (lockInfo?.hasExclusiveLock) {
        const data = new FormData();
        data.append('useCaseId', useCaseId);
        data.append('lockType', 'EXCLUSIVE');
        data.append('scope', scope);
        try { navigator.sendBeacon('/api/locks/release', data); } catch (error) {
          console.error('Failed to send beacon for lock release:', error);
        }
      }
    };
  }, [useCaseId, lockInfo?.hasExclusiveLock, scope]);

  return { lockInfo, isLocked, isExclusiveLocked, isSharedLocked, acquireExclusiveLock, releaseLock, refreshLockStatus, loading, error };
}
