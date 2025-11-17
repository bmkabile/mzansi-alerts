import React, { useState, useRef } from 'react';
import { Alert, AlertType, Location } from '../types';
import { ALERT_TYPE_DETAILS } from '../constants';
import { XIcon, CameraIcon, UploadCloudIcon, LocateFixedIcon } from './Icons';
import useGeolocation from '../hooks/useGeolocation';
import { savePendingAlert } from '../utils';

interface CreateAlertProps {
  onClose: () => void;
  onSave: (alert: Omit<Alert, 'id' | 'timestamp' | 'likes' | 'comments' | 'user'>) => void;
  onAddPendingAlert: (alert: Alert) => void;
  initialLocation: Location | null;
}

const CreateAlert: React.FC<CreateAlertProps> = ({ onClose, onSave, onAddPendingAlert, initialLocation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AlertType>(AlertType.Other);
  const [location, setLocation] = useState<Location | null>(initialLocation);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { location: currentGeo, error: geoError, getLocation } = useGeolocation();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseLocation = async () => {
    await getLocation();
    if(currentGeo) {
       setLocation(currentGeo);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
        alert("Please fill in all fields and set a location.");
        return;
    }

    const alertData = { title, description, type, location, imageUrl: imagePreview || undefined };

    if (!navigator.onLine) {
        const pendingAlert: Alert = {
          ...alertData,
          id: `offline-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: { name: 'Anonymous (Offline)' },
          likes: 0,
          comments: [],
          isResolved: false,
          isPending: true,
        };
        savePendingAlert(pendingAlert);
        onAddPendingAlert(pendingAlert);
        alert("You're offline. Your alert has been saved and will be submitted when you're back online.");
        onClose();
        return;
    }

    onSave(alertData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-text-primary">Report an Alert</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2" placeholder="e.g., Suspicious activity" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2" placeholder="Provide more details..."></textarea>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Alert Type</label>
              <select id="type" value={type} onChange={e => setType(e.target.value as AlertType)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2">
                {Object.entries(ALERT_TYPE_DETAILS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Add Photo</p>
              <div className="flex space-x-2">
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-50">
                  <CameraIcon className="h-6 w-6 mr-2" /> Take Photo
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-50">
                   <UploadCloudIcon className="h-6 w-6 mr-2" /> Upload
                </button>
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-md w-full h-auto max-h-48 object-cover" />}
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Location</p>
              <button type="button" onClick={handleUseLocation} className="w-full flex items-center justify-center p-3 border rounded-md text-primary font-semibold hover:bg-primary/5">
                <LocateFixedIcon className="h-5 w-5 mr-2" /> Use My Current Location
              </button>
              {location && <p className="text-sm text-green-600 mt-2 text-center">Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
              {geoError && <p className="text-sm text-red-600 mt-2 text-center">Error: {geoError}</p>}
            </div>
          </div>
        </form>
        <div className="p-4 border-t sticky bottom-0 bg-white">
          <button onClick={handleSubmit} type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors">Submit Alert</button>
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

export default CreateAlert;
