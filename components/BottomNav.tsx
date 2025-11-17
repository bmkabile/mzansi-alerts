import React from 'react';
import { PlusCircleIcon } from './Icons';

interface BottomNavProps {
  onCreateClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onCreateClick }) => {
  return (
    <footer className="absolute bottom-0 w-full max-w-md mx-auto z-10 p-4 pointer-events-none">
      <div className="flex justify-center">
        <button 
          onClick={onCreateClick}
          className="flex flex-col items-center text-primary pointer-events-auto group"
          aria-label="Report new alert"
        >
          <PlusCircleIcon className="h-16 w-16 text-primary bg-white rounded-full p-1 shadow-2xl group-hover:scale-105 transition-transform" />
        </button>
      </div>
    </footer>
  );
};

export default BottomNav;