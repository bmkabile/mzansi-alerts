import React from 'react';

const FeedAd: React.FC = () => {
  return (
    <div className="bg-gray-200 rounded-lg shadow-md p-4 flex flex-col items-center text-center my-3 animate-fade-in">
      <span className="text-xs font-bold text-gray-500 uppercase self-start">Advertisement</span>
      <div className="mt-2">
        <h4 className="font-bold text-gray-800">Mzansi Insurance</h4>
        <p className="text-sm text-gray-600">Stay covered for any eventuality. Get a free, no-obligation quote today and drive with peace of mind!</p>
        <button className="mt-3 bg-secondary text-text-primary font-bold py-1.5 px-4 rounded-full text-sm hover:opacity-90 transition-opacity">
          Get a Quote
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `}</style>
    </div>
  );
};

export default FeedAd;
