import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AlertType, Comment, Location, Councilor, EskomArea, EskomStatus, NotificationSettings } from './types';
import { MOCK_ALERTS, SA_WARDS_GEOJSON, MOCK_COUNCILORS, ALERT_TYPE_DETAILS } from './constants';
import Header from './components/Header';
import MapView from './components/MapView';
import CreateAlert from './components/CreateAlert';
import BottomNav from './components/BottomNav';
import AlertModal from './components/AlertModal';
import useGeolocation from './hooks/useGeolocation';
import { getAIWeatherAlert } from './services/geminiService';
import { getEskomStatus } from './services/eskomService';
import { WeatherCloudIcon, LoaderIcon, ChevronDownIcon } from './components/Icons';
import AlertFeed from './components/AlertFeed';
import NotificationsPanel from './components/NotificationsPanel';
import { pointInPolygon, haversineDistance, getPendingAlerts, clearPendingAlerts } from './utils';
import OfflineIndicator from './components/OfflineIndicator';
import PostAlertModal from './components/PostAlertModal';
import SettingsModal from './components/SettingsModal';

const PULL_THRESHOLD = 70; // Pixels to pull down to trigger refresh
const PRIORITY_ALERT_RADIUS_KM = 5; // 5km radius for priority alerts
const ESKOM_AREA_STORAGE_KEY = 'mzansi-eskom-area';
const NOTIFICATION_SETTINGS_STORAGE_KEY = 'mzansi-notification-settings';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  notificationRadius: 5, // Default to 5km
  enabledAlertTypes: Object.values(AlertType), // All enabled by default
};

const App: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { location, error: geoError, getLocation } = useGeolocation();
  const [priorityAlert, setPriorityAlert] = useState<{ message: string; type: AlertType | 'WEATHER' } | null>(null);
  const [isPriorityAlertExpanded, setPriorityAlertExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AlertType[]>(Object.values(AlertType));
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [councilor, setCouncilor] = useState<Councilor | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showAds, setShowAds] = useState(true);
  const [showPostAlertModal, setShowPostAlertModal] = useState(false);

  // New state for Eskom feature
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [userArea, setUserArea] = useState<EskomArea | null>(null);
  const [loadsheddingStatus, setLoadsheddingStatus] = useState<EskomStatus | null>(null);
  const [isLoadsheddingLoading, setIsLoadsheddingLoading] = useState(true);

  // New state for notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  // State for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const touchStartRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load user area and notification settings from localStorage on initial load
  useEffect(() => {
    try {
        const savedArea = localStorage.getItem(ESKOM_AREA_STORAGE_KEY);
        if (savedArea) {
            setUserArea(JSON.parse(savedArea));
        } else {
            setIsLoadsheddingLoading(false);
        }
        
        const savedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            setNotificationSettings(JSON.parse(savedSettings));
        }

    } catch (error) {
        console.error("Could not load user data from storage", error);
        setIsLoadsheddingLoading(false);
    }
  }, []);

  // Fetch loadshedding status when userArea changes or when coming online
  useEffect(() => {
    const fetchStatus = async () => {
      if (userArea && !isOffline) {
        setIsLoadsheddingLoading(true);
        const status = await getEskomStatus(userArea.id);
        setLoadsheddingStatus(status);
        setIsLoadsheddingLoading(false);
      } else if (!userArea) {
        setLoadsheddingStatus(null);
      }
    };
    fetchStatus();
  }, [userArea, isOffline]);

  const handleSaveArea = (area: EskomArea) => {
    setUserArea(area);
    try {
        localStorage.setItem(ESKOM_AREA_STORAGE_KEY, JSON.stringify(area));
    } catch (error) {
        console.error("Could not save user area to storage", error);
    }
  };
  
  const handleSaveNotificationSettings = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    try {
        localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Could not save notification settings to storage", error);
    }
  };

  const syncOfflineAlerts = useCallback(() => {
    const pendingAlerts = getPendingAlerts();
    if (pendingAlerts.length > 0) {
        console.log(`Syncing ${pendingAlerts.length} offline alerts.`);
        // In a real app, you'd send these to a server.
        // Here, we just update them in the main state.
        const pendingIds = new Set(pendingAlerts.map(a => a.id));
        
        setAlerts(prev => prev.map(alert => {
            if (pendingIds.has(alert.id)) {
                // "Syncing" the alert by removing the pending state
                return {
                    ...alert,
                    isPending: false,
                    user: { name: 'Anonymous' } // Update user from '... (Offline)'
                };
            }
            return alert;
        }));
        
        clearPendingAlerts();
        // Optional: show a success toast
    }
  }, []);

  useEffect(() => {
      const handleOnline = () => {
          setIsOffline(false);
          syncOfflineAlerts();
      };
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Initial sync on load, in case there are pending alerts from a previous session
      if (navigator.onLine) {
          syncOfflineAlerts();
      }

      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, [syncOfflineAlerts]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (location) {
      const userWard = SA_WARDS_GEOJSON.features.find(feature => 
        pointInPolygon(location, feature)
      );
      if (userWard) {
        const wardNo = userWard.properties.WARD_NO;
        const foundCouncilor = MOCK_COUNCILORS.find(c => c.ward === wardNo);
        setCouncilor(foundCouncilor || null);
      } else {
        setCouncilor(null);
      }
    }
  }, [location]);

  useEffect(() => {
    const findPriorityAlert = async () => {
        if (!location) return;

        const nearbyAlerts = alerts
            .filter(alert => !alert.isResolved)
            .filter(alert => haversineDistance(location, alert.location) < PRIORITY_ALERT_RADIUS_KM)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const loadsheddingAlert = nearbyAlerts.find(a => a.type === AlertType.PowerOutage);
        if (loadsheddingAlert) {
            setPriorityAlert({ message: loadsheddingAlert.title, type: AlertType.PowerOutage });
            return;
        }

        const crimeAlert = nearbyAlerts.find(a => a.type === AlertType.Crime);
        if (crimeAlert) {
            setPriorityAlert({ message: crimeAlert.title, type: AlertType.Crime });
            return;
        }

        if(isOffline) {
          setPriorityAlert(null);
          return;
        }

        // Fallback to AI weather alert
        try {
          const alertMessage = await getAIWeatherAlert(location);
          setPriorityAlert({ message: alertMessage, type: 'WEATHER' });
        } catch (error) {
          console.error("Error fetching AI weather alert:", error);
          // Don't show an error banner, just fail silently.
          setPriorityAlert(null);
        }
    };

    findPriorityAlert();
  }, [alerts, location, isOffline]);

  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleCloseAlertModal = () => {
    setSelectedAlert(null);
  };

  const handleAddAlert = (newAlert: Omit<Alert, 'id' | 'timestamp' | 'likes' | 'comments' | 'user'>) => {
    const alertToAdd: Alert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: { name: 'Anonymous' },
      likes: 0,
      comments: [],
      isResolved: false,
    };
    setAlerts(prevAlerts => [alertToAdd, ...prevAlerts]);
    setCreateModalOpen(false);
    setShowPostAlertModal(true);
  };

  const handleAddPendingAlert = (pendingAlert: Alert) => {
    setAlerts(prevAlerts => [pendingAlert, ...prevAlerts]);
  };
  
  const handleLike = (alertId: string) => {
      setAlerts(prev => prev.map(a => a.id === alertId ? {...a, likes: a.likes + 1} : a));
      if(selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert(prev => prev ? {...prev, likes: prev.likes + 1} : null);
      }
  }

  const handleAddComment = (alertId: string, commentText: string) => {
      const newComment: Comment = {
          id: `comment-${Date.now()}`,
          user: { name: 'Anonymous' },
          text: commentText,
          timestamp: new Date().toISOString()
      };
      
      setAlerts(prev => prev.map(a => a.id === alertId ? {...a, comments: [...a.comments, newComment]} : a));
      if(selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert(prev => prev ? {...prev, comments: [...prev.comments, newComment]} : null);
      }
  }

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? {...a, isResolved: true} : a));
    if(selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert(prev => prev ? {...prev, isResolved: true} : null);
    }
  };

  const handleToggleFilter = (filterType: AlertType) => {
    setActiveFilters(prev => 
      prev.includes(filterType) 
        ? prev.filter(f => f !== filterType) 
        : [...prev, filterType]
    );
  };

  const handleGoAdFree = () => {
    setShowAds(false);
  };

  const handleRefresh = useCallback(() => {
    if (isRefreshing || isOffline) return;
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate fetching new data by shuffling existing alerts
      setAlerts(prevAlerts => [...prevAlerts].sort(() => Math.random() - 0.5));
      setIsRefreshing(false);
    }, 1500); // Simulate network delay
  }, [isRefreshing, isOffline]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if(isOffline) return;
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartRef.current;
    const container = scrollContainerRef.current;

    if (container && container.scrollTop === 0 && pullDistance > 0 && !isRefreshing) {
      // Use a resistance factor for a more natural feel
      const position = Math.tanh(pullDistance / 150) * PULL_THRESHOLD * 1.5;
      setPullPosition(position);
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing) return;

    if (pullPosition >= PULL_THRESHOLD) {
      handleRefresh();
    }
    setPullPosition(0);
    touchStartRef.current = 0;
  };


  const filteredAlerts = alerts.filter(alert => activeFilters.includes(alert.type));
  const isOverlayActive = selectedAlert !== null || isNotificationsOpen || isCreateModalOpen || showPostAlertModal || isSettingsOpen;

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-background max-w-md mx-auto shadow-2xl">
      <Header 
        onNotificationsClick={() => setNotificationsOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        showAds={showAds}
        onGoAdFree={handleGoAdFree}
      />
      {priorityAlert && (() => {
        const isWeather = priorityAlert.type === 'WEATHER';
        const details = isWeather ? null : ALERT_TYPE_DETAILS[priorityAlert.type];
        const Icon = isWeather ? WeatherCloudIcon : details!.icon;
        
        const colors = {
            [AlertType.PowerOutage]: 'bg-alert-power/10 border-alert-power text-alert-power',
            [AlertType.Crime]: 'bg-alert-crime/10 border-alert-crime text-alert-crime',
            'WEATHER': 'bg-alert-weather/10 border-alert-weather text-alert-weather',
        };
        const title = isWeather ? 'AI Weather Alert' : `${details!.label} Alert`;
        const colorClass = colors[priorityAlert.type] || colors['WEATHER'];

        return (
            <div 
              className={`${colorClass} border-l-4 p-3 text-sm flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out`}
              onClick={() => setPriorityAlertExpanded(!isPriorityAlertExpanded)}
              aria-expanded={isPriorityAlertExpanded}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center w-full">
                <Icon className="h-6 w-6 mr-2 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className={!isPriorityAlertExpanded ? 'truncate' : ''}>
                    <strong className="font-semibold">{title}:</strong> {priorityAlert.message}
                  </p>
                </div>
                <ChevronDownIcon 
                  className={`h-5 w-5 ml-2 transform transition-transform duration-300 flex-shrink-0 ${isPriorityAlertExpanded ? 'rotate-180' : ''}`} 
                />
              </div>
            </div>
        );
      })()}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0" style={{ height: '45vh' }}>
            <MapView 
                alerts={filteredAlerts} 
                onSelectAlert={handleSelectAlert} 
                userLocation={location}
                activeFilters={activeFilters}
                onToggleFilter={handleToggleFilter}
                isOverlayActive={isOverlayActive}
                showAds={showAds}
            />
        </div>
        
        <div 
          className="flex-1 overflow-y-auto relative"
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Pull to refresh indicator */}
          <div className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-10"
              style={{ 
                  transform: `translateY(${isRefreshing ? 8 : pullPosition - 40}px)`,
                  opacity: isRefreshing ? 1 : Math.min(pullPosition / PULL_THRESHOLD, 1),
                  transition: isRefreshing ? 'transform 0.3s ease, opacity 0.3s ease' : 'none'
              }}
          >
              <div className="p-2 bg-white rounded-full shadow-lg">
                  <LoaderIcon 
                    className={`h-6 w-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} 
                    style={{transform: `rotate(${!isRefreshing ? pullPosition * 3 : 0}deg)`}}
                  />
              </div>
          </div>

          <div className="px-2 pt-2 pb-24">
            <AlertFeed 
                alerts={filteredAlerts} 
                onSelectAlert={handleSelectAlert} 
                councilor={councilor} 
                loadsheddingStatus={loadsheddingStatus}
                isLoadsheddingLoading={isLoadsheddingLoading}
                onSetArea={() => setSettingsOpen(true)}
            />
          </div>
        </div>
      </main>
      <OfflineIndicator isOffline={isOffline} />
      <BottomNav 
        onCreateClick={() => setCreateModalOpen(true)}
      />
      {selectedAlert && (
        <AlertModal 
          alert={selectedAlert} 
          onClose={handleCloseAlertModal} 
          onLike={handleLike}
          onAddComment={handleAddComment}
          onResolve={handleResolveAlert}
        />
      )}
      {isCreateModalOpen && (
        <CreateAlert 
          onClose={() => setCreateModalOpen(false)} 
          onSave={handleAddAlert}
          onAddPendingAlert={handleAddPendingAlert}
          initialLocation={location}
        />
      )}
      {isNotificationsOpen && (
        <NotificationsPanel
            alerts={alerts}
            userLocation={location}
            onClose={() => setNotificationsOpen(false)}
            onSelectAlert={handleSelectAlert}
            notificationSettings={notificationSettings}
        />
      )}
      {showPostAlertModal && (
        <PostAlertModal onClose={() => setShowPostAlertModal(false)} />
      )}
      {isSettingsOpen && (
        <SettingsModal
            onClose={() => setSettingsOpen(false)}
            onSaveArea={handleSaveArea}
            currentArea={userArea}
            currentNotificationSettings={notificationSettings}
            onSaveNotificationSettings={handleSaveNotificationSettings}
        />
      )}
    </div>
  );
};

export default App;