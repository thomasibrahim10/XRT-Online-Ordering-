import React, { useState, useEffect } from 'react';
import { adsPopup } from '../../config/constants';

const AdsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if configuration allows viewing
    if (!adsPopup.view) return;

    // Check if already seen in this session
    const hasSeen = sessionStorage.getItem('hasSeenAdsPopup');
    if (!hasSeen) {
      setIsOpen(true);
      sessionStorage.setItem('hasSeenAdsPopup', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[10000] p-4 animate-fade-in" onClick={handleClose}>
      <div 
        className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md relative shadow-2xl transform scale-100 transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors text-2xl leading-none focus:outline-none p-2"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <div className="mt-6">
          {adsPopup.image ? (
            <img 
              src={adsPopup.image} 
              alt="Promotion" 
              className="w-full max-h-[300px] object-cover rounded-xl mb-4 shadow-sm" 
            />
          ) : (
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-xl mb-4 text-gray-400 font-medium border-2 border-dashed border-gray-200">
              No Image
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{adsPopup.title}</h2>
            <p className="text-gray-600 leading-relaxed text-base">{adsPopup.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsPopup;
