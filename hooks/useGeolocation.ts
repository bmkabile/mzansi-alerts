import { useState, useCallback } from 'react';
import { Location } from '../types';

interface GeolocationState {
  loading: boolean;
  location: Location | null;
  error: string | null;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    location: null,
    error: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        setState({
          loading: false,
          location: null,
          error: error.message,
        });
      }
    );
  }, []);

  return { ...state, getLocation };
};

export default useGeolocation;
