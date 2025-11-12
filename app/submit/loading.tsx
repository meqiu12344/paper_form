import React from 'react';
import { Loader } from 'lucide-react';

// Ten komponent zostanie wyrenderowany na serwerze i pokaże się,
// zanim klient (SubmitPage, który używa useSearchParams) się załaduje.

export default function SubmitLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center p-8 rounded-xl bg-white shadow-xl">
        <Loader className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-lg text-gray-700 font-medium">Ładowanie i weryfikacja danych zamówienia...</p>
      </div>
    </div>
  );
}