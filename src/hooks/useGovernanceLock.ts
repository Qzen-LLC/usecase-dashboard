import { useState, useEffect, useCallback } from 'react';

export type GovernanceFramework = 'GOVERNANCE_EU_AI_ACT' | 'GOVERNANCE_ISO_42001' | 'GOVERNANCE_UAE_AI';

export interface GovernanceLockInfo {
  hasLock: boolean;
  canEdit: boolean;
  lockDetails?: {
    scope: GovernanceFramework;
    acquiredBy: string;
    acquiredAt: string;
    expiresAt: string;
    isOwnedByCurrentUser: boolean;
  };
  error?: string;
}

export interface UseGovernanceLockReturn {
  lockInfo: GovernanceLockInfo | null;
  isLocked: boolean;
  canEdit: boolean;
  acquireLock: () => Promise<boolean>;
  releaseLock: () => Promise<void>;
  refreshLockStatus: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useGovernanceLock = (
  useCaseId: string, 
  framework: GovernanceFramework
): UseGovernanceLockReturn => {
  const [lockInfo, setLockInfo] = useState<GovernanceLockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = lockInfo?.hasLock || false;
  const canEdit = lockInfo?.canEdit || false;

  const refreshLockStatus = useCallback(async () => {
    if (!useCaseId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Check for existing locks on this specific framework
      const response = await fetch(`/api/locks/status?useCaseId=${useCaseId}&scope=${framework}`);
      
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
  }, [useCaseId, framework]);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!useCaseId) return false;
    
    if (lockInfo?.hasLock && lockInfo?.canEdit) {
      console.log('Already have lock, skipping acquisition');
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/locks/acquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          useCaseId, 
          lockType: 'EXCLUSIVE', 
          scope: framework 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // Lock is held by another user
          setLockInfo({
            hasLock: true,
            canEdit: false,
            lockDetails: {
              scope: framework,
              acquiredBy: data.lockDetails.acquiredBy,
              acquiredAt: data.lockDetails.acquiredAt,
              expiresAt: data.lockDetails.expiresAt,
              isOwnedByCurrentUser: false
            }
          });
          return false;
        }
        throw new Error(data.error || 'Failed to acquire lock');
      }
      
      // Lock acquired successfully
      setLockInfo({
        hasLock: true,
        canEdit: true,
        lockDetails: {
          scope: framework,
          acquiredBy: 'You',
          acquiredAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          isOwnedByCurrentUser: true
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error acquiring lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to acquire lock');
      return false;
    } finally {
      setLoading(false);
    }
  }, [useCaseId, framework, lockInfo]);

  const releaseLock = useCallback(async (): Promise<void> => {
    if (!useCaseId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/locks/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          useCaseId, 
          lockType: 'EXCLUSIVE', 
          scope: framework 
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to release lock');
      }
      
      // Lock released successfully
      setLockInfo({
        hasLock: false,
        canEdit: false
      });
    } catch (err) {
      console.error('Error releasing lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to release lock');
    } finally {
      setLoading(false);
    }
  }, [useCaseId, framework]);

  // Initial load
  useEffect(() => {
    if (useCaseId) {
      refreshLockStatus();
    }
  }, [useCaseId, refreshLockStatus]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!useCaseId) return;
    
    const interval = setInterval(() => {
      refreshLockStatus();
    }, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [useCaseId, refreshLockStatus]);

  // Auto-release lock after 30 minutes
  useEffect(() => {
    if (!useCaseId || !lockInfo?.hasLock || !lockInfo?.canEdit) return;
    
    const timeout = setTimeout(async () => {
      try {
        await releaseLock();
      } catch (error) {
        console.error('Failed to auto-release lock:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearTimeout(timeout);
  }, [useCaseId, lockInfo?.hasLock, lockInfo?.canEdit, releaseLock]);

  // Handle page unload and navigation
  useEffect(() => {
    if (!useCaseId || !lockInfo?.hasLock || !lockInfo?.canEdit) return;

    let lockReleased = false;

    const releaseLockSafely = () => {
      if (lockReleased) return; // Prevent multiple releases
      lockReleased = true;
      console.log(`🔒 [GOVERNANCE] Releasing lock safely for ${framework}...`);
      
      try {
        // Try beacon first
        const data = new FormData();
        data.append('useCaseId', useCaseId);
        data.append('lockType', 'EXCLUSIVE');
        data.append('scope', framework);
        const beaconResult = navigator.sendBeacon('/api/locks/release', data);
        console.log(`🔒 [GOVERNANCE] Beacon result for ${framework}:`, beaconResult);
        
        // If beacon fails, try synchronous request
        if (!beaconResult) {
          console.log(`🔒 [GOVERNANCE] Beacon failed for ${framework}, trying synchronous request...`);
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/locks/release', false);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE', scope: framework }));
          console.log(`🔒 [GOVERNANCE] Synchronous request status for ${framework}:`, xhr.status);
        }
      } catch (error) {
        console.error(`🔒 [GOVERNANCE] Error in releaseLockSafely for ${framework}:`, error);
      }
    };

    // Add a global function that can be called from anywhere
    (window as any).__releaseGovernanceLockOnNavigation = releaseLockSafely;

    // Simple beforeunload handler
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log(`🔒 [GOVERNANCE] Beforeunload triggered for ${framework}`);
      releaseLockSafely();
    };

    // Simple pagehide handler
    const handlePageHide = (e: PageTransitionEvent) => {
      console.log(`🔒 [GOVERNANCE] Pagehide triggered for ${framework}`);
      releaseLockSafely();
    };

              // Add event listeners
          window.addEventListener('beforeunload', handleBeforeUnload);
          window.addEventListener('pagehide', handlePageHide);
    
              return () => {
            console.log(`🔒 [GOVERNANCE] Cleaning up event listeners for ${framework}`);
            releaseLockSafely(); // Always try to release lock on cleanup
            
            // Clean up global function
            delete (window as any).__releaseGovernanceLockOnNavigation;
            
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
          };
  }, [useCaseId, framework, lockInfo?.hasLock, lockInfo?.canEdit]);

  return {
    lockInfo,
    isLocked,
    canEdit,
    acquireLock,
    releaseLock,
    refreshLockStatus,
    loading,
    error
  };
};

