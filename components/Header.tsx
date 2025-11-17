import React from 'react';
import { BellIcon, SettingsIcon } from './Icons';
import Logo from './Logo';

interface HeaderProps {
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
  showAds: boolean;
  onGoAdFree: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationsClick, onSettingsClick, showAds, onGoAdFree }) => {
  return (
    <header className="bg-primary text-white shadow-lg p-4 flex justify-between items-center z-10 flex-shrink-0">
      <Logo />
      <div className="flex items-center space-x-4">
        {showAds && (
          <button
            onClick={onGoAdFree}
            className="text-xs font-bold bg-secondary text-primary px-3 py-1.5 rounded-full transition-colors shadow-md animate-ad-free-pulse"
          >
            Go Ad-Free
          </button>
        )}
        <button onClick={onSettingsClick} className="relative p-1 hover:bg-white/20 rounded-full">
            <SettingsIcon className="h-6 w-6" />
        </button>
        <button onClick={onNotificationsClick} className="relative p-1 hover:bg-white/20 rounded-full">
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