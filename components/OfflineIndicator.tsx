import React from 'react';
import { WifiOffIcon } from './Icons';

interface OfflineIndicatorProps {
  isOffline: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOffline }) => {
  return (
    <div
      className={`
        fixed bottom-16 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-md
        flex items-center justify-center p-2 rounded-lg
        bg-gray-800 text-white shadow-lg
        transition-all duration-500 ease-in-out
        ${isOffline ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}
      `}
      aria-live="polite"
    >
      <WifiOffIcon className="h-5 w-5 mr-2" />
      <span className="text-sm font-medium">You are currently offline.</span>
    </div>
  );
};

export default OfflineIndicator;