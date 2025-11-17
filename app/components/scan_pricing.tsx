"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Archive, Layers, Ruler, Mail, Phone, User, Send, Check } from "lucide-react";


const VAT_RATE = 0.23;
// --- INTERFEJSY (INTERFACES) ---
interface ScanFormData {
  format: string;
  quantity: number;
  colorOption: string; // ID opcji koloru
  name: string;
  email: string;
  phone: string;
  file: File | null;
  NIP: string;
  REGON: string;
  TYPE: string;
  PACZKOMAT: string;

  // Pola Specyficzne dla 'FormData' (opcjonalne w ogólnym kontekście)
  customWidth?: string;
  customHeight?: string;
  material?: string; // ID materiału/nośnika
  printLengthMultiplier?: string; // Mnożnik dla wydruku z rolki
  finishes?: string[];
}

interface SubmissionMessage {
  type: 'success' | 'error';
  text: string;
}

interface FormSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ComponentType<any>;
  required?: boolean;
  error?: string;
  maxLength?: number;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  required?: boolean;
}

interface ScanPriceItem {
  id: string;
  label: string;
  dimensions: string; // Wymiar w mm
  price_pln_netto: number; // Cena netto za 1 szt. (Baza za format)
}

// ZMIENIONY INTERFACE dla kolorów - teraz używa MULTIPLIER
interface ColorItem {
  id: string;
  label: string;
  multiplier: number; // MNOŻNIK zamiast dopłaty
}

interface PriceDetails {
  netto: number;
  vat: number;
  brutto: number;
  nettoDisplay: string;
}

// --- DANE (DATA - CENNIK SKANOWANIA) ---

// Cennik bazowy za format
const FORMATS: ScanPriceItem[] = [
  { id: "A4", label: "A4", dimensions: "297x210 mm", price_pln_netto: 0.20 },
  { id: "A3", label: "A3", dimensions: "420x297 mm", price_pln_netto: 0.40 },
  { id: "A2", label: "A2", dimensions: "594x420 mm", price_pln_netto: 2.60 },
  { id: "A1", label: "A1", dimensions: "841x594 mm", price_pln_netto: 5.20 },
  { id: "A0", label: "A0", dimensions: "1189x841 mm", price_pln_netto: 9.80 },
  { id: "A0_PLUS", label: "A0+", dimensions: "1292x914 mm", price_pln_netto: 10.80 },
];

// Opcje koloru skanowania (mnożnik ceny bazowej formatu)
const COLOR_OPTIONS: ColorItem[] = [
  { id: "MONO", label: "Czarno-biały", multiplier: 1.0 }, // Mnożnik 1.0 dla Czarno-białego
  { id: "COLOR", label: "Kolorowy", multiplier: 1.3 }, // Mnożnik 1.3 dla Kolorowego
];


// --- KOMPONENTY POMOCNICZE (HELPER COMPONENTS) ---

const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
    <div className="flex items-center text-green-600 mb-4 border-b pb-3">
      <Icon className="w-5 h-5 mr-3" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    {children}
      
    </div>
  );

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", value, onChange, placeholder, icon: Icon, required = false, error, maxLength = 10 }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-1 relative rounded-lg shadow-sm">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`block w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} py-2.5 ${Icon ? 'pl-10' : 'pl-3'} pr-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 sm:text-sm`}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg shadow-sm transition duration-150"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// --- KOMPONENT GŁÓWNY (MAIN COMPONENT) ---

const Scan_pricing: React.FC = () => {
  const initialData: ScanFormData = {
    format: "A4",
    customWidth: "",
    customHeight: "",
    quantity: 1,
    material: "STANDARD_80",
    colorOption: "1",
    printLengthMultiplier: "x1",
    finishes: [],
    name: "",
    email: "",
    phone: "",
    file: null,
    NIP: "",
    REGON: "",
    TYPE: "SCAN",
    PACZKOMAT: ""
  };

  const [formData, setFormData] = useState<ScanFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<SubmissionMessage | null>(null);
  const [showInpostMap, setShowInpostMap] = useState(false);
  const [selectedPaczkomat, setSelectedPaczkomat] = useState<any>(null);
  const inpostContainerRef = React.useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Math.max(1, parseInt(value, 10) || 1) : value,
      }));
    }

    setErrors(prev => ({ ...prev, [name]: '' }));
    setMessage(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.PACZKOMAT) {
      newErrors.PACZKOMAT = "Wybierz paczkomat przed wysłaniem formularza.";
    }

    if (!formData.name.trim()) newErrors.name = "Imię i nazwisko jest wymagane.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Wprowadź poprawny adres e-mail.";
    }
    if (formData.quantity < 1) newErrors.quantity = "Ilość musi być większa niż 0.";
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const calculatePrice = useMemo<PriceDetails>(() => {
    const quantity = formData.quantity || 1;
    const selectedFormat = FORMATS.find(f => f.id === formData.format);
    const selectedColorOption = COLOR_OPTIONS.find(c => c.id === formData.colorOption);

    let basePricePerUnit = 0;

    if (selectedFormat && selectedFormat.id !== 'CUSTOM') {
      basePricePerUnit = selectedFormat.price_pln_netto;
    } else if (formData.format === 'CUSTOM' && formData.customWidth && formData.customHeight) {
      const customWidth = parseFloat(formData.customWidth) / 1000;
      const customHeight = parseFloat(formData.customHeight) / 1000;
      const customArea = customWidth * customHeight;

      const A0_FORMAT = FORMATS.find(f => f.id === 'A0')!;
      const A0_PRICE = A0_FORMAT.price_pln_netto;

      basePricePerUnit = Math.max(basePricePerUnit, FORMATS.find(f => f.id === 'A4')!.price_pln_netto);
    }

    // Ustawienie minimalnej ceny na cenę A4 nawet w przypadku małych niestandardowych
    basePricePerUnit = Math.max(basePricePerUnit, FORMATS.find(f => f.id === 'A4')!.price_pln_netto);

    const colorMultiplier = selectedColorOption ? selectedColorOption.multiplier : 1.0;

    const unitPriceNetto = basePricePerUnit * colorMultiplier;

    // Całkowita cena netto
    const totalPriceNetto = unitPriceNetto * quantity;
    const vatAmount = totalPriceNetto * VAT_RATE;
    const totalPriceBrutto = totalPriceNetto + vatAmount;

    return {
      netto: totalPriceNetto,
      vat: vatAmount,
      brutto: totalPriceBrutto,
      nettoDisplay: totalPriceNetto.toFixed(2),
    };
  }, [formData.format, formData.customWidth, formData.customHeight, formData.quantity, formData.material, formData.printLengthMultiplier, formData.colorOption]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validate() || errors.file) { // Sprawdzenie ogólnej walidacji i błędu pliku
      setMessage({ type: 'error', text: 'Proszę popraw błędy w formularzu.' });
      return;
    }

    setIsSubmitting(true);

    let filePath = null;
    if (formData.file) {
      try {
        // Użyj obiektu FormData do wysłania pliku
        const fileData = new FormData();
        fileData.append('file', formData.file);

        // Wywołaj nowy endpoint API odpowiedzialny za tymczasowy upload
        const uploadResponse = await fetch('/api/upload-temp', {
          method: 'POST',
          body: fileData, // Nie ustawiamy Content-Type, przeglądarka zrobi to automatycznie
        });
        const uploadResult = await uploadResponse.json();

        if (uploadResult.filePath) {
          filePath = uploadResult.filePath;
        } else {
          throw new Error(uploadResult.error || "Błąd tymczasowego przesyłania pliku.");
        }
      } catch (uploadError: any) {
        console.error("❌ Błąd przesyłania pliku:", uploadError);
        setMessage({ type: 'error', text: `Błąd przesyłania pliku: ${uploadError.message}.` });
        setIsSubmitting(false);
        return;
      }
    }

    const { netto, brutto } = calculatePrice;
    const priceInCents = Math.round(brutto * 100);
    const calculatedPriceNetto = netto;
    const fileName = formData.file?.name || 'Brak pliku';
    const fileSizeKB = formData.file ? Math.round(formData.file.size / 1024) : 0;

    // Przygotuj i wyślij zamówienie (możesz dostosować endpoint oraz payload)
    try {
      // 1. Wywołaj API, które zapisze zamówienie do DB i zainicjuje sesję Stripe
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData, // Wszystkie dane formularza do zapisu
          priceInCents: priceInCents, // Cena brutto w groszach do Stripe
          calculatedPriceNetto: calculatedPriceNetto, // Cena netto do bazy danych
          fileName: fileName,
          fileSizeKB: fileSizeKB,
          filePath: filePath,
        }),
      });

      const data = await res.json();

      if (data.url) {

        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Nieznany błąd podczas inicjowania płatności.");
      }

    } catch (submitError: any) {
      console.error('❌ Błąd wysyłki zamówienia:', submitError);
      setMessage({ type: 'error', text: submitError.message || 'Nie udało się wysłać zamówienia.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Make sure global handler for InPost widget is available on window
 useEffect(() => {
  (window as any).afterPointSelected = (point: any) => {
    console.log("Selected InPost paczkomat:", point);

    // Zaktualizuj stan `selectedPaczkomat`
    setSelectedPaczkomat(point);

    // Zaktualizuj `formData` o dane paczkomatu
    setFormData((prev) => ({
      ...prev,
      PACZKOMAT: `${point.address.line1}, ${point.address.line2}`,
    }));

    // Zamknij mapę po wyborze paczkomatu
    setShowInpostMap(false);
  };

  return () => {
    try {
      delete (window as any).afterPointSelected;
    } catch (e) {
      (window as any).afterPointSelected = undefined;
    }
  };
}, []);

  // Mount / unmount the inpost widget dynamically when modal is opened
  useEffect(() => {
    const container = inpostContainerRef.current;
    if (!container) return;

    if (showInpostMap) {
      // If the element already exists, do nothing
      if (container.querySelector('inpost-geowidget')) return;

      const widget = document.createElement('inpost-geowidget');
      widget.setAttribute('style', 'width: 100%; height: 100%;');
      widget.setAttribute('onpoint', 'afterPointSelected');
      widget.setAttribute('token', "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzQlpXVzFNZzVlQnpDYU1XU3JvTlBjRWFveFpXcW9Ua2FuZVB3X291LWxvIn0.eyJleHAiOjIwNDU1MDg2OTUsImlhdCI6MTczMDE0ODY5NSwianRpIjoiYmI1MzdiNWQtYzBlNi00MGUxLWE4MGYtYWU3YzQzMTI1MjhhIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5pbnBvc3QucGwvYXV0aC9yZWFsbXMvZXh0ZXJuYWwiLCJzdWIiOiJmOjEyNDc1MDUxLTFjMDMtNGU1OS1iYTBjLTJiNDU2OTVlZjUzNTpjNUNRd0d4d3p6RjVsMzZpaTdhOUdRdlkyc0t0QU9Yb0l3em1GTlItZDFnIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2hpcHgiLCJzZXNzaW9uX3N0YXRlIjoiM2IwMjg4OTItMmY1Mi00YjQwLTkzZWItYWE2ODUxYjQ2OTc3Iiwic2NvcGUiOiJvcGVuaWQgYXBpOmFwaXBvaW50cyIsInNpZCI6IjNiMDI4ODkyLTJmNTItNGI0MC05M2ViLWFhNjg1MWI0Njk3NyIsImFsbG93ZWRfcmVmZXJyZXJzIjoiIiwidXVpZCI6ImRmZjVmMjYyLTZjNTEtNDhhNi05OThhLTMzMTYxZGM1ZjUzMSJ9.T0iXl4nKc8-K8cylXVNcPTMgLEjZmN-naNjXUCeM_wEJ7cslCJVvOgH4b8_Xo8QtPvNJ6-22V9V9fhP7Xu5u_IXCJzF_Vx3X0aeRZpIyZJeFwyX0YOoWqyWcVkvwS_1K7SguWmg_gj4zgvshbgSDmDAmaku_khr8WNLuBNyvMsbwXEGnzV668DuER8V8dkQWBeU0gNZtAtZjIVqjsiWs8E4gYgmLkFOCEEach45fnM1mMDInDRmkKGdYV2FKfLwGaX-Ay0cr2Iyh2JDyxwoeVNrQru8mI41_zjHcz34zlFRMpuAQZAZGLfeJyJfXily0S1ehdqjhSfC_IEVFn6aUyQ");
      widget.setAttribute('language', 'pl');
      widget.setAttribute('config', 'parcelCollect');
      container.appendChild(widget);
    } else {
      // Cleanup - remove widget
      container.innerHTML = '';
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [showInpostMap]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            Kalkulator Skanowania Dokumentów
          </h1>
          <p className="text-gray-500">
            Wybierz format i ilość, aby oszacować koszt skanowania.
          </p>
        </header>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            <div className="flex items-center">
              <Check className={`w-5 h-5 mr-3 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Sekcja 1: Parametry Skanowania */}
          <FormSection title="Parametry Skanowania" icon={Ruler}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Format Skanowania"
                name="format"
                value={formData.format}
                onChange={handleChange}
                options={FORMATS.map(f => ({ value: f.id, label: `${f.label} (${f.dimensions}) - ${f.price_pln_netto.toFixed(2)} PLN netto` }))}
                required
              />
              <SelectField
                label="Opcja Koloru"
                name="colorOption"
                value={formData.colorOption}
                onChange={handleChange}
                options={COLOR_OPTIONS.map(c => ({ value: c.id, label: `${c.label} (Mnożnik: x${c.multiplier})` }))}
                required
              />
              <InputField
                label="Ilość sztuk do skanowania"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder={`Ilość dokumentów w formacie`}
                required
                error={errors.quantity}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Załącz plik (np. informacja o zamówieniu, max. 10MB)
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="block w-full text-sm text-gray-600 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer transition duration-150"
              />
              {formData.file && (
                <p className="mt-2 text-xs text-gray-500">
                  Wybrany plik: **{formData.file.name}** ({Math.round(formData.file.size / 1024)} KB)
                </p>
              )}
            </div>
          </FormSection>

          {/* Sekcja 2: Dane Kontaktowe i Plik */}
          <FormSection title="Dane Kontaktowe i Załącznik" icon={Layers}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="Imię i nazwisko"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jan Kowalski"
                icon={User}
                required
                error={errors.name}
              />
              <InputField
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jan.kowalski@email.com"
                icon={Mail}
                required
                error={errors.email}
              />
              <InputField
                label="Telefon"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="np. 123456789"
                icon={Phone}
                error={errors.phone}
              />

              <InputField
                label="NIP"
                name="NIP"
                value={formData.NIP}
                onChange={handleChange}
                placeholder="np. 1234563218"
                maxLength={10}
                icon={User}
                error={errors.NIP}
              />
              <InputField
                label="REGON"
                name="REGON"
                value={formData.REGON}
                onChange={handleChange}
                placeholder="np. 012345678"
                icon={User}
                error={errors.REGON}
              />
            </div>
            {/* InPost Map Button */}
            <div className="w-1/3">
              <button
                type="button"
                onClick={() => setShowInpostMap(true)}
                className="w-full text-lg font-semibold text-green-700 border border-green-200 bg-white hover:bg-green-50 transition duration-200 shadow-sm"
              >
                Wybierz paczkomat InPost
              </button>
            </div>

            {/* Display selected InPost paczkomat */}
            {formData.PACZKOMAT && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Wybrany paczkomat:</p>
                <pre className="text-xs text-gray-600 mt-1">{formData.PACZKOMAT}</pre>
              </div>
            )}
          </FormSection>

          {/* Sekcja: Podsumowanie i Akcja */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 pb-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-sm uppercase font-semibold">
                Szacowana cena brutto:
              </p>
              <p className="text-4xl font-extrabold text-indigo-700">
                {calculatePrice.brutto.toFixed(2)} PLN
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Netto: {calculatePrice.nettoDisplay} PLN | VAT (23%): {calculatePrice.vat.toFixed(2)} PLN
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold rounded-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 transition duration-200 shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Archive className="w-5 h-5 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Złóż zamówienie na skanowanie
                </>
              )}
            </button>
          
          </div>
        </form>
      </div>
      {/* InPost modal with the widget (renders only in browser) */}
      {showInpostMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[70vh] overflow-hidden relative">
            <button
              onClick={() => setShowInpostMap(false)}
              className="absolute right-3 top-3 text-gray-600 hover:text-gray-900">
              Zamknij
            </button>
            <div className="h-full">
              {/* If you don't have the inpost script loaded globally, you must add it to your layout or head. */}
                      <div className="absolute inset-0">
                        {/* Container where we will mount the InPost widget dynamically */}
                        <div ref={inpostContainerRef} className="h-full" />
                      </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan_pricing;