import React from 'react';

const FeedAd: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-stretch overflow-hidden border border-gray-200/80 my-3 animate-fade-in">
      <div className="flex-shrink-0 w-24">
        <img src="https://picsum.photos/seed/insurance/200/300" alt="Insurance ad" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Advertisement</p>
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Ad</span>
        </div>
        <h4 className="font-semibold text-text-primary mt-1">Drive with Peace of Mind</h4>
        <p className="text-sm text-text-secondary mt-1">Get a free, no-obligation insurance quote from Mzansi Insurance today!</p>
        <button className="mt-2 bg-secondary text-text-primary font-bold py-1 px-3 rounded-full text-xs hover:opacity-90 transition-opacity">
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