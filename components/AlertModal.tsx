import React, { useState } from 'react';
import { Alert, AlertType, Comment } from '../types';
import { ALERT_TYPE_DETAILS } from '../constants';
import { XIcon, HeartIcon, MessageCircleIcon, SendIcon, Share2Icon, CheckCircleIcon, TwitterIcon, WhatsAppIcon, ClipboardIcon, ClipboardCheckIcon } from './Icons';
import { timeAgo } from '../utils';

interface AlertModalProps {
  alert: Alert;
  onClose: () => void;
  onLike: (alertId: string) => void;
  onAddComment: (alertId: string, commentText: string) => void;
  onResolve: (alertId: string) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose, onLike, onAddComment, onResolve }) => {
    const [newComment, setNewComment] = useState('');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [copied, setCopied] = useState(false);

    const details = ALERT_TYPE_DETAILS[alert.type];
    const Icon = details.icon;
    const colorClass = `bg-${details.color}`;
    const canBeResolved = alert.type === AlertType.Pothole || alert.type === AlertType.WaterIssue;

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newComment.trim()) {
            onAddComment(alert.id, newComment);
            setNewComment('');
        }
    }
    
    const handleShare = async () => {
      const shareUrl = window.location.href; // Simplified URL for demo
      const shareText = `Mzansi Alert: ${alert.title}\n\n${alert.description}\n\nSee more on Mzansi Alerts:`;
      const shareData = {
        title: `Mzansi Alert: ${alert.title}`,
        text: shareText,
        url: shareUrl,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error("Share failed:", err);
        }
      } else {
        // Fallback for desktop browsers
        setShowShareOptions(true);
      }
    };

    const copyToClipboard = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setShowShareOptions(false);
            }, 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50" onClick={() => setShowShareOptions(false)}>
            <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">{details.label} Alert</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <XIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto">
                    {alert.imageUrl && <img src={alert.imageUrl} alt={alert.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
                    
                    {alert.isResolved && (
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center space-x-2 my-4">
                          <CheckCircleIcon className="h-5 w-5" />
                          <span className="font-semibold text-sm">This issue has been marked as resolved.</span>
                      </div>
                    )}

                    <h3 className="text-xl font-semibold mb-2 text-text-primary">{alert.title}</h3>
                    <p className="text-text-secondary mb-4">{alert.description}</p>
                    <div className="text-xs text-gray-400 mb-4 flex items-center">
                        <span>Reported by {alert.user.name}</span>
                        <span className="mx-2">&bull;</span>
                        <span>{timeAgo(alert.timestamp)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-b py-2 mb-4">
                        <div className="flex items-center space-x-4">
                           <button onClick={() => onLike(alert.id)} className="flex items-center space-x-1 text-gray-600 hover:text-accent">
                               <HeartIcon className="h-5 w-5" />
                               <span>{alert.likes}</span>
                           </button>
                           <div className="flex items-center space-x-1 text-gray-600">
                               <MessageCircleIcon className="h-5 w-5" />
                               <span>{alert.comments.length}</span>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {canBeResolved && !alert.isResolved && (
                                <button onClick={() => onResolve(alert.id)} className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span>Resolve</span>
                                </button>
                            )}
                            <div className="relative">
                                <button onClick={handleShare} className="flex items-center space-x-1 text-gray-600 hover:text-primary">
                                    <Share2Icon className="h-5 w-5" />
                                    <span>Share</span>
                                </button>
                                {showShareOptions && (
                                    <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-2xl border p-2 z-20" onClick={e => e.stopPropagation()}>
                                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mzansi Alert: ${alert.title} - ${alert.description}`)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md">
                                            <TwitterIcon className="h-5 w-5 text-[#1DA1F2]" />
                                            <span className="text-sm">Share on X</span>
                                        </a>
                                         <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mzansi Alert: ${alert.title}\n${alert.description}\n${window.location.href}`)}`} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md">
                                            <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                                            <span className="text-sm">Share on WhatsApp</span>
                                        </a>
                                        <button onClick={copyToClipboard} className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md">
                                            {copied ? <ClipboardCheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5 text-gray-600" />}
                                            <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-text-primary">Comments</h4>
                        {alert.comments.map(comment => (
                            <div key={comment.id} className="flex space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm">
                                    {comment.user.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-100 rounded-lg p-2">
                                        <p className="font-semibold text-sm">{comment.user.name}</p>
                                        <p className="text-sm text-text-secondary">{comment.text}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{timeAgo(comment.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                         {alert.comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
                    </div>
                </div>

                {/* Comment Input */}
                {!alert.isResolved && (
                    <div className="p-4 border-t mt-auto sticky bottom-0 bg-white">
                        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button type="submit" className="bg-primary text-white rounded-full p-2.5 hover:bg-primary/90">
                                <SendIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                )}
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

export default AlertModal;