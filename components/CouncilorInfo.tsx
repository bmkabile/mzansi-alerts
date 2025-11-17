import React from 'react';
import { Councilor } from '../types';
import { UserIcon } from './Icons';

interface CouncilorInfoProps {
  councilor: Councilor;
}

const CouncilorInfo: React.FC<CouncilorInfoProps> = ({ councilor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Local Councilor</h3>
      <div className="flex items-center space-x-4">
        <img src={councilor.imageUrl} alt={councilor.name} className="h-16 w-16 rounded-full object-cover border-2 border-primary/20" />
        <div className="flex-1">
          <p className="font-bold text-lg text-text-primary">{councilor.name}</p>
          <p className="text-sm text-text-secondary">Ward {councilor.ward} - {councilor.party}</p>
          <p className="text-sm text-primary font-semibold mt-1">{councilor.contact}</p>
        </div>
      </div>
    </div>
  );
};

export default CouncilorInfo;
