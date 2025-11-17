import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './Icons';

interface PostAlertModalProps {
  onClose: () => void;
}

const PostAlertModal: React.FC<PostAlertModalProps> = ({ onClose }) => {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center flex flex-col items-center animate-zoom-in">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-text-primary">Thank You!</h2>
        <p className="text-text-secondary mt-2 mb-6">Your alert has been successfully submitted and is now live.</p>

        {/* Ad Placeholder */}
        <div className="w-full rounded-lg p-4 space-y-2 mb-6 relative overflow-hidden h-36 flex flex-col justify-end text-white">
          <img src="https://picsum.photos/seed/house/400/200" alt="Secure home" className="absolute inset-0 w-full h-full object-cover z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>
          <div className="relative z-20 text-left">
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">SPONSORED</div>
            <p className="font-bold">Protect your home with Mzansi Secure.</p>
            <p className="text-sm font-light">24/7 armed response from just R299/pm.</p>
            <a href="#" className="mt-1 inline-block bg-secondary text-text-primary font-bold text-xs py-1.5 px-3 rounded-full hover:opacity-90 transition-opacity">Learn More</a>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          disabled={countdown > 0}
          className={`
            w-full font-bold py-3 px-4 rounded-lg transition-colors
            ${countdown > 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary/90'
            }
          `}
        >
          {countdown > 0 ? `You can close in ${countdown}s` : 'Close'}
        </button>
      </div>
       <style>{`
          @keyframes zoom-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-zoom-in { animation: zoom-in 0.3s ease-out; }
        `}</style>
    </div>
  );
};

export default PostAlertModal;