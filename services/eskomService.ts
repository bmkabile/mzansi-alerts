import { EskomArea, EskomStatus, Location } from '../types';

const API_BASE_URL = 'https://developer.sepush.co.za/business/2.0';
// In a real application, this key should come from a secure source like environment variables.
const API_TOKEN = process.env.ESP_API_KEY; 

export const searchEskomArea = async (text: string): Promise<EskomArea[]> => {
  if (!API_TOKEN) {
    console.warn("EskomSePush API key is not configured. Returning mock data for development.");
    if (text.toLowerCase().includes('fourways')) {
        return [{ id: 'eskde-10-fourwaysext10cityofjohannesburggauteng', name: 'Fourways Ext 10', region: 'City of Johannesburg, Gauteng' }];
    }
    return [];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/areas_search?text=${encodeURIComponent(text)}`, {
      headers: { 'token': API_TOKEN }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.areas as EskomArea[];
  } catch (error) {
    console.error('Failed to search for Eskom area:', error);
    return [];
  }
};

export const searchEskomAreaByCoords = async (location: Location): Promise<EskomArea[]> => {
    if (!API_TOKEN) {
        console.warn("EskomSePush API key is not configured. Returning mock data for development.");
        // Mock response for a location near Johannesburg
        if (location.lat < -26 && location.lat > -26.3 && location.lng > 27.9 && location.lng < 28.2) {
            return [
                { id: 'eskde-10-fourwaysext10cityofjohannesburggauteng', name: 'Fourways Ext 10', region: 'City of Johannesburg, Gauteng' },
                { id: 'cpt-11-somesuburb', name: 'Sandton', region: 'City of Johannesburg, Gauteng' }
            ];
        }
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/areas_nearby?lat=${location.lat}&lon=${location.lng}`, {
            headers: { 'token': API_TOKEN }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.areas as EskomArea[];
    } catch (error) {
        console.error('Failed to search for Eskom area by coordinates:', error);
        return [];
    }
};

export const getEskomStatus = async (areaId: string): Promise<EskomStatus | null> => {
    if (!API_TOKEN) {
        console.warn("EskomSePush API key is not configured. Returning null.");
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/area?id=${encodeURIComponent(areaId)}&test=current`, {
            headers: { 'token': API_TOKEN }
        });
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return data as EskomStatus;
    } catch (error) {
        console.error('Failed to get Eskom status:', error);
        return null;
    }
};