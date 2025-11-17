import React from 'react';
import { Alert, Councilor, EskomStatus } from '../types';
import AlertCard from './AlertCard';
import CouncilorInfo from './CouncilorInfo';
import FeedAd from './FeedAd';
import LoadsheddingStatus from './LoadsheddingStatus';

interface AlertFeedProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  councilor: Councilor | null;
  loadsheddingStatus: EskomStatus | null;
  isLoadsheddingLoading: boolean;
  onSetArea: () => void;
}

const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onSelectAlert, councilor, loadsheddingStatus, isLoadsheddingLoading, onSetArea }) => {
  const showNoAlertsMessage = alerts.length === 0;

  return (
    <div className="space-y-3">
      <LoadsheddingStatus status={loadsheddingStatus} isLoading={isLoadsheddingLoading} onSetArea={onSetArea} />
      {councilor && <CouncilorInfo councilor={councilor} />}
      
      {showNoAlertsMessage ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 pt-16">
            <h3 className="text-lg font-semibold">No Alerts Found</h3>
            <p className="text-sm">Try adjusting your filters or checking back later.</p>
        </div>
      ) : (
        alerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            <AlertCard alert={alert} onSelectAlert={onSelectAlert} />
            {index === 2 && alerts.length > 3 && <FeedAd key="feed-ad-1" />}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default AlertFeed;
