import React from 'react';
import { EskomStatus } from '../types';
import { ZapOffIcon } from './Icons';

interface LoadsheddingStatusProps {
    status: EskomStatus | null;
    isLoading: boolean;
    onSetArea: () => void;
}

const LoadsheddingStatus: React.FC<LoadsheddingStatusProps> = ({ status, isLoading, onSetArea }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 mb-3 flex items-center justify-center">
                <p className="text-sm text-gray-500">Checking loadshedding status...</p>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-alert-power/10 flex items-center justify-center">
                        <ZapOffIcon className="h-6 w-6 text-alert-power" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary">Loadshedding Status</h3>
                        <p className="text-sm text-text-secondary">
                            <button onClick={onSetArea} className="text-primary font-semibold hover:underline">Set your area</button> to get live updates.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    const nextEvent = status.events.find(event => new Date(event.start) > new Date());
    const currentEvent = status.events.find(event => {
        const now = new Date();
        return new Date(event.start) <= now && new Date(event.end) > now;
    });

    const getStage = (note: string): string => {
        const match = note.match(/Stage (\d+)/);
        return match ? `Stage ${match[1]}` : note;
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 border-alert-power">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-alert-power/10 flex items-center justify-center">
                    <ZapOffIcon className="h-6 w-6 text-alert-power" />
                </div>
                <div>
                     <h3 className="font-bold text-text-primary">Loadshedding: {status.info.name}</h3>
                     {currentEvent ? (
                         <p className="text-sm font-semibold text-alert-crime">
                             ACTIVE: {getStage(currentEvent.note)} until {new Date(currentEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                     ) : nextEvent ? (
                         <p className="text-sm font-semibold text-green-700">
                             Next: {getStage(nextEvent.note)} at {new Date(nextEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                     ) : (
                         <p className="text-sm font-semibold text-green-700">No loadshedding scheduled for today.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default LoadsheddingStatus;
