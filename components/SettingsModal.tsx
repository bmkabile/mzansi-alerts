import React, { useState, useCallback, useEffect } from 'react';
import { XIcon, LoaderIcon, LocateFixedIcon } from './Icons';
import { EskomArea } from '../types';
import { searchEskomArea, searchEskomAreaByCoords } from '../services/eskomService';
import useGeolocation from '../hooks/useGeolocation';

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
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSaveArea, currentArea }) => {
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
      onClose();
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

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
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
        </div>
      </div>
       <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
    </div>
  );
};

export default SettingsModal;