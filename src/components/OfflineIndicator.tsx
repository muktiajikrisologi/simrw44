import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 right-4 md:right-auto md:w-auto z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2 text-xs font-semibold shadow-xl animate-bounce"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Mode Offline — Data tersimpan di cache lokal peramban Anda.</span>
    </div>
  );
};
