import React from 'react';
import { BellIcon } from './Icons';
import Logo from './Logo';

interface HeaderProps {
  onNotificationsClick: () => void;
  showAds: boolean;
  onGoAdFree: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationsClick, showAds, onGoAdFree }) => {
  return (
    <header className="bg-primary text-white shadow-lg p-4 flex justify-between items-center z-10 flex-shrink-0">
      <Logo />
      <div className="flex items-center space-x-4">
        {showAds && (
          <button
            onClick={onGoAdFree}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
          >
            Ad-Free R10/pm
          </button>
        )}
        <button onClick={onNotificationsClick} className="relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;