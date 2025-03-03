import React from 'react';
import { WifiOff } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

const OfflineAlert = () => {
  const { isOffline } = useAuth();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 fixed bottom-4 right-4 z-50 shadow-md rounded-md max-w-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700 font-medium">
            You are currently offline
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Some features may be limited. Changes will be saved and synced when you're back online.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineAlert;