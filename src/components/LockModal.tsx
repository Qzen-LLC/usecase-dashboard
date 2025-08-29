'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Edit, Clock, AlertTriangle, CheckCircle, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LockInfo {
  hasExclusiveLock: boolean;
  exclusiveLockDetails?: {
    type: string;
    acquiredBy: string;
    acquiredAt: string;
    expiresAt: string;
  };
  canEdit?: boolean;
  message?: string;
}

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockInfo: LockInfo | null;
  onAcquireExclusiveLock: () => Promise<boolean>;
  onProceedToAssessment: () => void;
  onViewLockedUseCase: () => void;
  loading: boolean;
  error: string | null;
}

export const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  lockInfo,
  onAcquireExclusiveLock,
  onProceedToAssessment,
  onViewLockedUseCase,
  loading,
  error
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isAcquiringLock, setIsAcquiringLock] = useState(false);

  // Calculate time remaining for lock expiration
  useEffect(() => {
    if (!lockInfo?.exclusiveLockDetails?.expiresAt) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(lockInfo.exclusiveLockDetails!.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockInfo?.exclusiveLockDetails?.expiresAt]);

  const handleAcquireLock = async () => {
    setIsAcquiringLock(true);
    try {
      if (lockInfo?.hasExclusiveLock) {
        // If already locked, just redirect to view page
        onViewLockedUseCase();
      } else {
        // If not locked, acquire lock and then proceed to assessment
        const success = await onAcquireExclusiveLock();
        if (success) {
          onProceedToAssessment();
        }
      }
    } finally {
      setIsAcquiringLock(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lockInfo?.hasExclusiveLock ? (
              <>
                <Lock className="h-5 w-5 text-orange-600" />
                Assessment Locked
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 text-green-600" />
                Ready to Assess
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {lockInfo?.hasExclusiveLock ? (
            // Locked state
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Currently being edited by {lockInfo.exclusiveLockDetails?.acquiredBy}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700 dark:text-orange-300">
                      Expires in: {timeRemaining}
                    </span>
                  </div>

                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Locked since {formatTime(lockInfo.exclusiveLockDetails?.acquiredAt || '')} on {formatDate(lockInfo.exclusiveLockDetails?.acquiredAt || '')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Available state
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      You can start editing now
                    </span>
                  </div>
                  
                  <div className="text-xs text-green-600 dark:text-green-400">
                    No other users are currently editing this assessment
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-2">
            {lockInfo?.hasExclusiveLock ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || isAcquiringLock}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                                 <Button
                   onClick={onViewLockedUseCase}
                   disabled={loading || isAcquiringLock}
                   className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                 >
                   <Eye className="h-4 w-4 mr-2" />
                   View Read-Only
                 </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || isAcquiringLock}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAcquireLock}
                  disabled={loading || isAcquiringLock}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAcquiringLock ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Acquiring Lock...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Start Assessment
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LockModal;
