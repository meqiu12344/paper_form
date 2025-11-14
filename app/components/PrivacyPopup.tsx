"use client";

import { useState, SVGProps } from 'react';

// Ikona "X" do zamknięcia (możesz użyć dowolnej innej metody/biblioteki)
const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-4 w-4" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2} 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function PrivacyPopup() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null; // Nie renderuj niczego, jeśli dymek został zamknięty
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 
                 max-w-xs p-3 
                 bg-white border border-gray-200 rounded-lg shadow-xl 
                 transition duration-300"
    >
      <button
        onClick={() => setIsVisible(false)} // Zamykanie dymka
        className="absolute top-1 right-1 p-1 
                   text-gray-400 hover:text-gray-600 
                   rounded-full transition duration-150"
        aria-label="Zamknij powiadomienie o prywatności"
      >
        <CloseIcon />
      </button>

      <p className="text-xs text-gray-600 pr-4"> {/* Dodano pr-4 na odstęp od przycisku */}
        <span className="font-semibold text-gray-800">Prywatność Danych:</span> 
        Dane z formularza są zapisywane wyłącznie w celu realizacji i wysyłki zamówienia. 
        Szczegóły znajdziesz w Polityce Prywatności.
      </p>
    </div>
  );
}