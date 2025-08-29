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

export const useLock = (useCaseId: string): UseLockReturn => {
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
      setLockInfo(data.lockInfo || null);
    } catch (err) {
      console.error('Error refreshing lock status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh lock status');
    } finally {
      setLoading(false);
    }
  }, [useCaseId]);

  const acquireExclusiveLock = useCallback(async (): Promise<boolean> => {
    if (!useCaseId) return false;

    // Don't try to acquire if we already have one
    if (lockInfo?.hasExclusiveLock) {
      console.log('Already have exclusive lock, skipping acquisition');
      return true;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/locks/acquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useCaseId,
          lockType: 'EXCLUSIVE'
        }),
      });

      const data = await response.json();

            if (!response.ok) {
        if (response.status === 409) {
          // Lock conflict - update lock info
          setLockInfo({
            hasExclusiveLock: true,
            exclusiveLockDetails: data.lockDetails
          });
          // Don't throw error for lock conflicts - this is expected
          return false;
        }
        throw new Error(data.error || 'Failed to acquire exclusive lock');
      }

      // Successfully acquired exclusive lock
      setLockInfo({
        hasExclusiveLock: true,
        canEdit: true
      });

      return true;
    } catch (err) {
      console.error('Error acquiring exclusive lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to acquire exclusive lock');
      return false;
    } finally {
      setLoading(false);
    }
  }, [useCaseId, lockInfo?.hasExclusiveLock]);

  const releaseLock = useCallback(async (lockType: 'SHARED' | 'EXCLUSIVE'): Promise<void> => {
    if (!useCaseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/locks/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useCaseId,
          lockType
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to release lock');
      }

      // Refresh lock status after release
      await refreshLockStatus();
    } catch (err) {
      console.error('Error releasing lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to release lock');
    } finally {
      setLoading(false);
    }
  }, [useCaseId, refreshLockStatus]);

  // Initial lock status check
  useEffect(() => {
    if (useCaseId) {
      refreshLockStatus();
    }
  }, [useCaseId, refreshLockStatus]);

  // Auto-refresh lock status every 5 minutes
  useEffect(() => {
    if (!useCaseId) return;

    const interval = setInterval(() => {
      refreshLockStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [useCaseId, refreshLockStatus]);

  // Auto-release lock after 30 minutes of inactivity
  useEffect(() => {
    if (!useCaseId || !lockInfo?.hasExclusiveLock) return;

    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/locks/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE' }),
        });
        // Update local state
        setLockInfo(prev => prev ? { ...prev, hasExclusiveLock: false } : null);
      } catch (error) {
        console.error('Failed to auto-release lock:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearTimeout(timeout);
  }, [useCaseId, lockInfo?.hasExclusiveLock]);

  // Auto-release lock only when user navigates to a different page (not when switching tabs)
  useEffect(() => {
    if (!useCaseId) return;

    const handleBeforeUnload = async () => {
      // Check if current user has an exclusive lock
      if (lockInfo?.hasExclusiveLock) {
        try {
          // Release the lock before page unload
          await fetch('/api/locks/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE' }),
            // Use keepalive to ensure request completes
            keepalive: true
          });
        } catch (error) {
          console.error('Failed to release lock on page unload:', error);
        }
      }
    };

    // Add event listener for page navigation only
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Also try to release lock when component unmounts
      if (lockInfo?.hasExclusiveLock) {
        // Use sendBeacon for more reliable delivery during page unload
        const data = new FormData();
        data.append('useCaseId', useCaseId);
        data.append('lockType', 'EXCLUSIVE');
        
        try {
          navigator.sendBeacon('/api/locks/release', data);
        } catch (error) {
          console.error('Failed to send beacon for lock release:', error);
        }
      }
    };
  }, [useCaseId, lockInfo?.hasExclusiveLock]);

  return {
    lockInfo,
    isLocked,
    isExclusiveLocked,
    isSharedLocked,
    acquireExclusiveLock,
    releaseLock,
    refreshLockStatus,
    loading,
    error
  };
};
