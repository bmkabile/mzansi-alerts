import React from 'react';
import { Alert } from '../types';
import { ALERT_TYPE_DETAILS } from '../constants';
import { HeartIcon, MessageCircleIcon, CheckCircleIcon, UploadCloudIcon } from './Icons';
import { timeAgo } from '../utils';

interface AlertCardProps {
    alert: Alert;
    onSelectAlert: (alert: Alert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onSelectAlert }) => {
    const details = ALERT_TYPE_DETAILS[alert.type];
    const Icon = details.icon;
    const colorClass = `bg-${details.color}`;

    return (
        <div 
            onClick={() => onSelectAlert(alert)}
            className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-stretch cursor-pointer overflow-hidden border border-gray-200/80 ${alert.isResolved ? 'opacity-70' : ''}`}
        >
            <div className={`flex-shrink-0 w-2 ${colorClass}`}></div>
            <div className="flex-1 p-4 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold text-gray-500 uppercase tracking-wide`}>{details.label}</p>
                        <p className={`font-semibold text-text-primary truncate mt-1 ${alert.isResolved ? 'line-through' : ''}`}>{alert.title}</p>
                    </div>
                    <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
                <p className={`text-sm text-text-secondary mt-2 line-clamp-2`}>{alert.description}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <HeartIcon className="h-4 w-4" />
                            <span>{alert.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <MessageCircleIcon className="h-4 w-4" />
                            <span>{alert.comments.length}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         {alert.isResolved && (
                            <div className="flex items-center text-green-600 font-semibold">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                <span>Resolved</span>
                            </div>
                        )}
                        {alert.isPending && (
                            <div className="flex items-center text-orange-500 font-semibold animate-pulse">
                                <UploadCloudIcon className="h-4 w-4 mr-1" />
                                <span>Pending</span>
                            </div>
                        )}
                        <span>{timeAgo(alert.timestamp, true)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlertCard;
