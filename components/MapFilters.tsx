import React from 'react';
import { AlertType } from '../types';
import { ALERT_TYPE_DETAILS } from '../constants';

interface MapFiltersProps {
  activeFilters: AlertType[];
  onToggleFilter: (type: AlertType) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ activeFilters, onToggleFilter }) => {
  return (
    <div className="flex flex-col space-y-2">
      {Object.entries(ALERT_TYPE_DETAILS).map(([type, details], index) => {
        const isActive = activeFilters.includes(type as AlertType);
        const Icon = details.icon;
        
        // Dynamically construct Tailwind classes for colors
        const color = details.color; // e.g., 'alert-crime'
        const activeClasses = `bg-${color} text-white border-transparent`;
        const inactiveClasses = `bg-white/80 backdrop-blur-sm text-${color} border-${color} hover:bg-white hover:scale-105`;

        return (
          <button
            key={type}
            onClick={() => onToggleFilter(type as AlertType)}
            title={details.label}
            className={`
              flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full border 
              transition-all duration-300 ease-in-out shadow-md animate-filter-pulse
              ${isActive ? activeClasses : inactiveClasses}
            `}
            style={{ animationDelay: `${index * 150}ms` }}
            aria-label={`Filter by ${details.label}`}
            aria-pressed={isActive}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
};

export default MapFilters;