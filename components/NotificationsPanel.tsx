import React, { useMemo } from 'react';
import { Alert, Location } from '../types';
import { XIcon } from './Icons';
import AlertCard from './AlertCard';
import { haversineDistance } from '../utils';

interface NotificationsPanelProps {
  alerts: Alert[];
  userLocation: Location | null;
  onClose: () => void;
  onSelectAlert: (alert: Alert) => void;
}

const MAX_DISTANCE_KM = 5; // 5km radius for "nearby"
const MAX_AGE_DAYS = 3; // 3 days for "recent"

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ alerts, userLocation, onClose, onSelectAlert }) => {
  const recentAndNearbyAlerts = useMemo(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

    return alerts.filter(alert => {
      const alertDate = new Date(alert.timestamp);
      const isRecent = alertDate > threeDaysAgo;
      
      let isNearby = false;
      if (userLocation) {
        const distance = haversineDistance(userLocation, alert.location);
        isNearby = distance <= MAX_DISTANCE_KM;
      }

      return isRecent || isNearby;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts, userLocation]);
  
  const handleCardClick = (alert: Alert) => {
    onSelectAlert(alert);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-in-from-top max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
        <h2 className="text-lg font-bold text-text-primary">Recent & Nearby Alerts</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
          <XIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {recentAndNearbyAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAndNearbyAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onSelectAlert={handleCardClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
            <h3 className="text-lg font-semibold">No Recent or Nearby Alerts</h3>
            <p className="text-sm">Things are quiet around you!</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide-in-from-top {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-in-from-top { animation: slide-in-from-top 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default NotificationsPanel;
