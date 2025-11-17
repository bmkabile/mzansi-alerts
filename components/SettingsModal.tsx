import React, { useState, useCallback, useEffect } from 'react';
import { XIcon, LoaderIcon, LocateFixedIcon } from './Icons';
import { EskomArea, NotificationSettings, AlertType } from '../types';
import { searchEskomArea, searchEskomAreaByCoords } from '../services/eskomService';
import useGeolocation from '../hooks/useGeolocation';
import { ALERT_TYPE_DETAILS } from '../constants';

// Custom debounce hook to prevent excessive API calls
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface SettingsModalProps {
  onClose: () => void;
  onSaveArea: (area: EskomArea) => void;
  currentArea: EskomArea | null;
  currentNotificationSettings: NotificationSettings;
  onSaveNotificationSettings: (settings: NotificationSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSaveArea, currentArea, currentNotificationSettings, onSaveNotificationSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<EskomArea[]>([]);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { location: fetchedLocation, error: geoError, getLocation } = useGeolocation();

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 3) {
      setSearchResults([]);
      setInfoMessage(null);
      return;
    }
    setIsTextLoading(true);
    setInfoMessage(null);
    const results = await searchEskomArea(term);
    setSearchResults(results);
    if (results.length === 0) {
      setInfoMessage(`No results found for "${term}".`);
    }
    setIsTextLoading(false);
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleUseLocation = () => {
    setIsLocationLoading(true);
    setInfoMessage('Getting your location...');
    setSearchTerm('');
    setSearchResults([]);
    getLocation();
  };

  useEffect(() => {
    if (fetchedLocation) {
      const findAreas = async () => {
        setInfoMessage('Finding nearby areas...');
        const results = await searchEskomAreaByCoords(fetchedLocation);
        setSearchResults(results);
        if (results.length === 0) {
          setInfoMessage('No nearby loadshedding areas found for your location.');
        } else {
          setInfoMessage(null);
        }
        setIsLocationLoading(false);
      };
      findAreas();
    }
  }, [fetchedLocation]);

  useEffect(() => {
    if (geoError) {
      setInfoMessage(`Location error: ${geoError}. Please enable location services in your browser/device settings.`);
      setIsLocationLoading(false);
    }
  }, [geoError]);
  
  const handleSelectArea = (area: EskomArea) => {
      onSaveArea(area);
      // Maybe show a success message before closing
      // onClose();
  };

  // --- Notification Settings Handlers ---
  const handleTogglePush = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...currentNotificationSettings, pushEnabled: e.target.checked };
    onSaveNotificationSettings(newSettings);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...currentNotificationSettings, notificationRadius: parseInt(e.target.value, 10) };
    onSaveNotificationSettings(newSettings);
  };

  const handleToggleAlertType = (alertType: AlertType) => {
    const currentTypes = currentNotificationSettings.enabledAlertTypes;
    const newTypes = currentTypes.includes(alertType)
        ? currentTypes.filter(t => t !== alertType)
        : [...currentTypes, alertType];
    const newSettings = { ...currentNotificationSettings, enabledAlertTypes: newTypes };
    onSaveNotificationSettings(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-text-primary">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Loadshedding Area</h3>
            {currentArea ? (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
                    <p className="font-semibold text-sm">Current Area:</p>
                    <p className="text-sm">{currentArea.name}, {currentArea.region}</p>
                </div>
            ) : (
                 <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
                    <p className="font-semibold text-sm">No area set for loadshedding alerts.</p>
                </div>
            )}
            <p className="text-sm text-gray-600 mb-2">Search for your suburb or use your GPS location to get loadshedding notifications.</p>
            <div className="relative mb-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., Fourways, Sandton"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 pr-10"
                />
                {isTextLoading && <LoaderIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />}
            </div>

            <button 
              onClick={handleUseLocation}
              disabled={isLocationLoading}
              className="w-full flex items-center justify-center p-2 border rounded-md text-primary font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isLocationLoading ? (
                <>
                  <LoaderIcon className="h-5 w-5 mr-2 animate-spin" />
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <LocateFixedIcon className="h-5 w-5 mr-2" />
                  <span>Use My Current Location</span>
                </>
              )}
            </button>

            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map(area => (
                    <div key={area.id} onClick={() => handleSelectArea(area)} className="p-3 bg-gray-50 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors">
                        <p className="font-semibold text-text-primary">{area.name}</p>
                        <p className="text-sm text-text-secondary">{area.region}</p>
                    </div>
                ))}
                {infoMessage && (
                    <p className="text-center text-gray-500 p-4">{infoMessage}</p>
                )}
            </div>

            <div className="border-t my-4 pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Notification Preferences</h3>
                
                {/* Push Notifications Toggle */}
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                    <label htmlFor="push-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">Enable Push Notifications</label>
                    <label htmlFor="push-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="push-toggle" className="sr-only" checked={currentNotificationSettings.pushEnabled} onChange={handleTogglePush} />
                            <div className="block bg-gray-300 w-12 h-7 rounded-full"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform"></div>
                        </div>
                    </label>
                </div>

                {/* Notification Radius Slider */}
                <div className="mb-4">
                    <label htmlFor="radius-slider" className="block text-sm font-medium text-gray-700">
                        Notification Radius: <span className="font-bold text-primary">{currentNotificationSettings.notificationRadius} km</span>
                    </label>
                    <input 
                        id="radius-slider"
                        type="range" 
                        min="1" 
                        max="50" 
                        step="1" 
                        value={currentNotificationSettings.notificationRadius}
                        onChange={handleRadiusChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                    />
                </div>

                {/* Alert Type Toggles */}
                <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">Notify me about:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ALERT_TYPE_DETAILS).map(([type, details]) => {
                            const isEnabled = currentNotificationSettings.enabledAlertTypes.includes(type as AlertType);
                            const Icon = details.icon;
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleToggleAlertType(type as AlertType)}
                                    className={`flex items-center space-x-2 p-2 rounded-lg border text-sm transition-colors duration-200 ${
                                    isEnabled ? `bg-${details.color}/10 border-${details.color}/50 text-text-primary shadow-sm` : 'bg-gray-100 border-transparent text-gray-500'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 text-${details.color} ${!isEnabled && 'opacity-50'}`} />
                                    <span className={`font-semibold ${isEnabled ? 'text-text-primary' : 'text-text-secondary'}`}>{details.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
      </div>
       <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
          
          /* Toggle Switch Styles */
          input:checked ~ .dot {
            transform: translateX(100%);
          }
          input:checked ~ .block {
            background-color: #004D40; /* primary color */
          }
          .dot {
            transition: transform 0.2s ease-in-out;
          }

          /* Custom Range Slider Styles */
          .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #004D40; /* primary */
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
          }

          .range-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #004D40; /* primary */
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
          }
        `}</style>
    </div>
  );
};

export default SettingsModal;