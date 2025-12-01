"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Archive, Layers, Ruler, Mail, Phone, User, Send, Check, Info } from "lucide-react";
// Usunięto import createClient z Supabase, ponieważ używamy go tylko w route.ts i verify-payment.ts
// import { createClient } from "@supabase/supabase-js"; 

// Stała dla VAT (używamy 23% dla polskiego standardu)
const VAT_RATE = 0.23;
// Opłata za dostawę InPost (brutto)
const INPOST_FEE_BRUTTO = 16.99;
// Dodatkowa opłata za zamówienie kopii (brutto) na arkusz
const COPY_SURCHARGE_BRUTTO = 2.0;

// --- INTERFACES ---
interface FormData {
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

  // Pola Specyficzne dla 'FormData' (opcjonalne w ogólnym kontekście)
  customWidth?: string; 
  customHeight?: string;
  material?: string; // ID materiału/nośnika
  printLengthMultiplier?: string; // Mnożnik dla wydruku z rolki
  finishes?: string[];
  PACZKOMAT?: string;
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

interface PriceItem {
  id: string;
  label: string;
  width: number; // width in mm
  height: number; // height in mm
  price_pln_netto: number; // base price netto (from CSV)
}

interface MaterialItem {
  id: string;
  label: string;
  price_multiplier: number;
}

interface LengthMultiplierItem {
  id: string;
  label: string;
  multiplier: number;
  description: string;
}

// NEW: Color options interface
interface ColorItem {
  id: string;
  label: string;
  multiplier: number;
}

interface PriceDetails {
    netto: number;
    vat: number;
    brutto: number;
    nettoDisplay: string;
}

// --- DANE (CENNIK Z CSV) ---

// Zaktualizowany cennik bazowy dla formatów A i B
const FORMATS: PriceItem[] = [
  // Formaty A
  { id: "A4", label: "A4 (297x210 mm)", width: 210, height: 297, price_pln_netto: 2.44 },
  { id: "A3", label: "A3 (420x297 mm)", width: 297, height: 420, price_pln_netto: 4.88 },
  { id: "A2", label: "A2 (594x420 mm)", width: 420, height: 594, price_pln_netto: 6.50 },
  { id: "A1", label: "A1 (841x594 mm)", width: 594, height: 841, price_pln_netto: 9.76 },
  { id: "A0", label: "A0 (1189x841 mm)", width: 841, height: 1189, price_pln_netto: 12.20 },
  { id: "A0_PLUS", label: "A0+ (1292x914 mm)", width: 914, height: 1292, price_pln_netto: 13.82 },
  // Formaty B (Dodane na podstawie cennika)
  { id: "B4", label: "B4 (353x250 mm)", width: 250, height: 353, price_pln_netto: 2.93 },
  { id: "B3", label: "B3 (500x353 mm)", width: 353, height: 500, price_pln_netto: 5.86 },
  { id: "B2", label: "B2 (707x500 mm)", width: 500, height: 707, price_pln_netto: 7.80 },
  { id: "B1", label: "B1 (1000x707 mm)", width: 707, height: 1000, price_pln_netto: 11.71 },
  { id: "B0", label: "B0 (1414x1000 mm)", width: 1000, height: 1414, price_pln_netto: 16.58 },

  { id: "CUSTOM", label: "Własny rozmiar", width: 0, height: 0, price_pln_netto: 0 },
];

// Materiały/Nośniki (Zastosowanie i Nośnik z CSV)
const MATERIALS: MaterialItem[] = [
  { id: "Rys. Techniczny / Papier standardowy 80g/m²", label: "Rys. Techniczny / Papier standardowy 80g/m²", price_multiplier: 1.0 }, // CENA = x1
  { id: "Plakat / Papier powlekany 180g/m²", label: "Plakat / Papier powlekany 180g/m²", price_multiplier: 2.0 }, // CENA = x2
  { id: "Fotografia / Papier fotograficzny Satyna/Perła 260g/m²", label: "Fotografia / Papier fotograficzny Satyna/Perła 260g/m²", price_multiplier: 3.0 }, // Przyjmuję x3 na podstawie ceny PLAKAT A0/P.KOLOR A0 vs CAD A0
];

// Mnożniki długości wydruku z rolki (DŁUŻSZY BOK x1...x6 z CSV)
const LENGTH_MULTIPLIERS: LengthMultiplierItem[] = [
  { id: "x1", label: "Długość x1 (standard)", multiplier: 1, description: "Standardowa długość formatu (np. A0)" },
  { id: "x2", label: "Długość x2 (druk z rolki)", multiplier: 2, description: "Wielokrotność formatu x2" },
  { id: "x3", label: "Długość x3 (druk z rolki)", multiplier: 3, description: "Wielokrotność formatu x3" },
  { id: "x4", label: "Długość x4 (druk z rolki)", multiplier: 4, description: "Wielokrotność formatu x4" },
  { id: "x5", label: "Długość x5 (druk z rolki)", multiplier: 5, description: "Wielokrotność formatu x5" },
  { id: "x6", label: "Długość x6 (druk z rolki)", multiplier: 6, description: "Wielokrotność formatu x6" },
];

// NEW: Lista kolorów z mnożnikami cenowymi
const COLOR_OPTIONS: ColorItem[] = [
  { id: "1. DRUK CZARNO-BIAŁY, DO 10% POW. ZADRUKU", label: "DRUK CZARNO-BIAŁY, DO 10% POW. ZADRUKU", multiplier: 1.0 },
  { id: "2. DRUK CZARNO-BIAŁY, DO 50% POW. ZADRUKU", label: "DRUK CZARNO-BIAŁY, DO 50% POW. ZADRUKU", multiplier: 2.0 },
  { id: "3. DRUK CZARNO-BIAŁY, PONAD 50% POW. ZADRUKU", label: "DRUK CZARNO-BIAŁY, PONAD 50% POW. ZADRUKU", multiplier: 3.0 },
  { id: "4. DRUK KOLOROWY, DO 10% POW. ZADRUKU", label: "DRUK KOLOROWY, DO 10% POW. ZADRUKU", multiplier: 2.0 },
  { id: "5. DRUK KOLOROWY, DO 50% POW. ZADRUKU", label: "DRUK KOLOROWY, DO 50% POW. ZADRUKU", multiplier: 3.0 },
  { id: "6. DRUK KOLOROWY, PONAD 50% POW. ZADRUKU", label: "DRUK KOLOROWY, PONAD 50% POW. ZADRUKU", multiplier: 4.0 },
];

// --- KOMPONENTY POMOCNICZE ---

const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
    <div className="flex items-center text-indigo-600 mb-4 border-b pb-3">
      <Icon className="w-5 h-5 mr-3" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", value, onChange, placeholder, icon: Icon, required = false, error, maxLength }) => (
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
        maxLength={maxLength}
        required={required}
        className={`block w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} py-2.5 ${Icon ? 'pl-10' : 'pl-3'} pr-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 sm:text-sm`}
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
      className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition duration-150"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// --- KOMPONENT GŁÓWNY ---

const Print_pricing: React.FC = () => {
  const initialData: FormData = {
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
    TYPE: "PRINT",
    PACZKOMAT: "",
  };

  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<SubmissionMessage | null>(null);
  const [showInpostMap, setShowInpostMap] = useState(false);
  const [selectedPaczkomat, setSelectedPaczkomat] = useState<any>(null);
  const inpostContainerRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      // Prosta walidacja rozmiaru pliku (max 10MB)
      // Dozwolone rozszerzenia
      const allowedExt = ['.dwg','.dxf','.pdf','.jpg','.jpeg','.jpe','.png','.bmp','.tiff','.ifc','.xcf','.doc','.xls'];
      if (file) {
        const lowerName = file.name.toLowerCase();
        const isAllowed = allowedExt.some(ext => lowerName.endsWith(ext));
        if (!isAllowed) {
          setErrors(prev => ({ ...prev, file: 'Nieprawidłowy typ pliku. Dozwolone: dwg, dxf, pdf, jpg, jpeg, jpe, png, bmp, tiff, ifc, xcf, doc, xls.' }));
          setFormData(prev => ({ ...prev, [name]: null }));
          setMessage({ type: 'error', text: 'Nieprawidłowy typ pliku. Proszę wybrać plik o dozwolonym rozszerzeniu.' });
          return;
        }
      }
      if (file && file.size > 10 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, file: 'Plik jest za duży (max 10MB).' }));
          setFormData(prev => ({ ...prev, [name]: null }));
          setMessage({ type: 'error', text: 'Plik jest za duży (max 10MB). Proszę załącz mniejszy plik.' });
          return;
      }
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newFinishes = checked
        ? [...(prev.finishes ?? []), value]
        : (prev.finishes ?? []).filter(f => f !== value);
      return { ...prev, finishes: newFinishes };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Imię i nazwisko jest wymagane.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Wprowadź poprawny adres e-mail.";
    }
    if (formData.format === 'CUSTOM') {
      if (!formData.customWidth || parseFloat(formData.customWidth) <= 0) newErrors.customWidth = "Podaj poprawną szerokość (mm).";
      if (!formData.customHeight || parseFloat(formData.customHeight) <= 0) newErrors.customHeight = "Podaj poprawną wysokość (mm).";
    }
    if (formData.quantity < 1) newErrors.quantity = "Ilość musi być większa niż 0.";
    // Walidacja, czy wybrano plik (jeśli jest to wymagane)
    // if (!formData.file) newErrors.file = "Załącz plik do wydruku.";

    // Minimalna cena zamówienia: 2 PLN brutto
    if (calculatePrice.brutto < 2) {
      newErrors.price = "Minimalna cena zamówienia to 2 PLN.";
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Make sure global handler for InPost widget is available on window
 useEffect(() => {
  (window as any).afterPointSelectedPrint = (point: any) => {
    console.log("Selected InPost paczkomat (Print):", point);

    setSelectedPaczkomat(point);

    setFormData((prev) => ({
      ...prev,
      PACZKOMAT: `${point.address.line1}, ${point.address.line2}`,
    }));

    setShowInpostMap(false);
  };

  return () => {
    try {
      delete (window as any).afterPointSelectedPrint;
    } catch (e) {
      (window as any).afterPointSelectedPrint = undefined;
    }
  };
}, []);

  // Mount / unmount the inpost widget dynamically when modal is opened
  useEffect(() => {
    const container = inpostContainerRef.current;
    if (!container) return;

    if (showInpostMap) {
      if (container.querySelector('inpost-geowidget')) return;

      const widget = document.createElement('inpost-geowidget');
      widget.setAttribute('style', 'width: 100%; height: 100%;');
      widget.setAttribute('onpoint', 'afterPointSelectedPrint');
      widget.setAttribute('token', "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzQlpXVzFNZzVlQnpDYU1XU3JvTlBjRWFveFpXcW9Ua2FuZVB3X291LWxvIn0.eyJleHAiOjIwNDU1MDg2OTUsImlhdCI6MTczMDE0ODY5NSwianRpIjoiYmI1MzdiNWQtYzBlNi00MGUxLWE4MGYtYWU3YzQzMTI1MjhhIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5pbnBvc3QucGwvYXV0aC9yZWFsbXMvZXh0ZXJuYWwiLCJzdWIiOiJmOjEyNDc1MDUxLTFjMDMtNGU1OS1iYTBjLTJiNDU2OTVlZjUzNTpjNUNRd0d4d3p6RjVsMzZpaTdhOUdRdlkyc0t0QU9Yb0l3em1GTlItZDFnIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2hpcHgiLCJzZXNzaW9uX3N0YXRlIjoiM2IwMjg4OTItMmY1Mi00YjQwLTkzZWItYWE2ODUxYjQ2OTc3Iiwic2NvcGUiOiJvcGVuaWQgYXBpOmFwaXBvaW50cyIsInNpZCI6IjNiMDI4ODkyLTJmNTItNGI0MC05M2ViLWFhNjg1MWI0Njk3NyIsImFsbG93ZWRfcmVmZXJyZXJzIjoiIiwidXVpZCI6ImRmZjVmMjYyLTZjNTEtNDhhNi05OThhLTMzMTYxZGM1ZjUzMSJ9.T0iXl4nKc8-K8cylXVNcPTMgLEjZmN-naNjXUCeM_wEJ7cslCJVvOgH4b8_Xo8QtPvNJ6-22V9V9fhP7Xu5u_IXCJzF_Vx3X0aeRZpIyZJeFwyX0YOoWqyWcVkvwS_1K7SguWmg_gj4zgvshbgSDmDAmaku_khr8WNLuBNyvMsbwXEGnzV668DuER8V8dkQWBeU0gNZtAtZjIVqjsiWs8E4gYgmLkFOCEEach45fnM1mMDInDRmkKGdYV2FKfLwGaX-Ay0cr2Iyh2JDyxwoeVNrQru8mI41_zjHcz34zlFRMpuAQZAZGLfeJyJfXily0S1ehdqjhSfC_IEVFn6aUyQ");
      widget.setAttribute('language', 'pl');
      widget.setAttribute('config', 'parcelCollect');
      container.appendChild(widget);
    } else {
      container.innerHTML = '';
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [showInpostMap]);

  // Zaktualizowana funkcja obliczająca cenę, zwracająca obiekt PriceDetails
  const calculatePrice = useMemo<PriceDetails>(() => {
    const quantity = formData.quantity || 1;
    const selectedFormat = FORMATS.find(f => f.id === formData.format);
    const selectedMaterial = MATERIALS.find(m => m.id === formData.material);
    const selectedLengthMultiplier = LENGTH_MULTIPLIERS.find(l => l.id === formData.printLengthMultiplier);
    const selectedColorOption = COLOR_OPTIONS.find(c => c.id === formData.colorOption);

    let basePricePerUnit = 0;

    if (selectedFormat && selectedFormat.id !== 'CUSTOM') {
      basePricePerUnit = selectedFormat.price_pln_netto;
    } else if (formData.format === 'CUSTOM' && formData.customWidth && formData.customHeight) {
      const customWidth = parseFloat(formData.customWidth) / 1000;
      const customHeight = parseFloat(formData.customHeight) / 1000;
      const customArea = customWidth * customHeight;

      const A0_FORMAT = FORMATS.find(f => f.id === 'A0')!;
      const A0_AREA = A0_FORMAT.width * A0_FORMAT.height / 1000000;
      const A0_PRICE = A0_FORMAT.price_pln_netto;
      const pricePerM2 = A0_PRICE / A0_AREA; 
      
      basePricePerUnit = customArea * pricePerM2;
      basePricePerUnit = Math.max(basePricePerUnit, FORMATS.find(f => f.id === 'A4')!.price_pln_netto);
    }
    
    // Ustawienie minimalnej ceny na cenę A4 nawet w przypadku małych niestandardowych
    basePricePerUnit = Math.max(basePricePerUnit, FORMATS.find(f => f.id === 'A4')!.price_pln_netto);


    const materialMultiplier = selectedMaterial ? selectedMaterial.price_multiplier : 1.0;
    const lengthMultiplier = selectedLengthMultiplier ? selectedLengthMultiplier.multiplier : 1.0;
    const colorMultiplier = selectedColorOption ? selectedColorOption.multiplier : 1.0;

    const unitPriceNetto = basePricePerUnit * materialMultiplier * lengthMultiplier * colorMultiplier;

    // Całkowita cena netto
    const totalPriceNetto = unitPriceNetto * quantity;
    let vatAmount = totalPriceNetto * VAT_RATE;
    let totalPriceBrutto = totalPriceNetto + vatAmount;

    // Jeśli wybrano paczkomat InPost (PACZKOMAT !== 'Odbiór osobisty' i niepuste), dolicz opłatę dostawy
    let totalNetto = totalPriceNetto;
    if (formData.PACZKOMAT && formData.PACZKOMAT.toString().trim() !== 'Odbiór osobisty') {
      const shippingBrutto = INPOST_FEE_BRUTTO;
      const shippingNetto = shippingBrutto / (1 + VAT_RATE);
      const shippingVat = shippingBrutto - shippingNetto;
      // Dodajemy składniki dostawy do łącznych wartości
      totalPriceBrutto += shippingBrutto;
      vatAmount += shippingVat;
      totalNetto += shippingNetto;
    }

    // Jeśli użytkownik wybrał "KOPIĘ", doliczamy opłatę za każdy arkusz (brutto)
    if (formData.TYPE === 'COPY') {
      const copyBrutto = COPY_SURCHARGE_BRUTTO * quantity;
      const copyNetto = copyBrutto / (1 + VAT_RATE);
      const copyVat = copyBrutto - copyNetto;
      totalPriceBrutto += copyBrutto;
      vatAmount += copyVat;
      totalNetto += copyNetto;
    }

    return {
      netto: totalNetto,
      vat: vatAmount,
      brutto: totalPriceBrutto,
      nettoDisplay: totalNetto.toFixed(2),
    };
  }, [formData.format, formData.customWidth, formData.customHeight, formData.quantity, formData.material, formData.printLengthMultiplier, formData.colorOption, formData.PACZKOMAT, formData.TYPE]);


  // FUNKCJA OBSŁUGI SUBMITU I PŁATNOŚCI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validate() || errors.file) { // Sprawdzenie ogólnej walidacji i błędu pliku
      setMessage({ type: 'error', text: 'Proszę popraw błędy w formularzu.' });
      return;
    }

    setIsSubmitting(true);

    // Jeśli nie wybrano paczkomatu, traktujemy to jako odbiór osobisty
    const finalFormData = {
      ...formData,
      PACZKOMAT: formData.PACZKOMAT && formData.PACZKOMAT.toString().trim() ? formData.PACZKOMAT : 'Odbiór osobisty',
    };

    // Uaktualnij lokalny stan tak, aby UI odzwierciedlało decyzję
    setFormData(prev => ({ ...prev, PACZKOMAT: finalFormData.PACZKOMAT }));

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
    
    // UWAGA: Przesłanie pliku (formData.file) musi odbyć się osobnym żądaniem po pomyślnej płatności
    // lub za pomocą biblioteki Storage (np. Supabase Storage)

    try {
      // 1. Wywołaj API, które zapisze zamówienie do DB i zainicjuje sesję Stripe
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          formData: finalFormData, // Wszystkie dane formularza do zapisu (PACZKOMAT domyślnie 'Odbiór osobisty' jeśli nie wybrano)
          priceInCents: priceInCents, // Cena brutto w groszach do Stripe
          calculatedPriceNetto: calculatedPriceNetto, // Cena netto do bazy danych
          fileName: fileName,
          fileSizeKB: fileSizeKB,
          filePath: filePath,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Nieznany błąd podczas inicjowania płatności.");
      }
    } catch (error: any) {
      console.error("❌ Błąd płatności:", error);
      setMessage({ type: 'error', text: `Błąd podczas inicjowania płatności: ${error.message}. Spróbuj ponownie.` });
      setIsSubmitting(false);
    }
  };


  const materialOptions = MATERIALS.map(m => ({ value: m.id, label: m.label }));
  const lengthMultiplierOptions = LENGTH_MULTIPLIERS.map(l => ({ value: l.id, label: l.label }));
  const colorOptions = COLOR_OPTIONS.map(c => ({ value: c.id, label: c.label }));
  
  const isCustomFormat = formData.format === 'CUSTOM';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">
            Kalkulator Wydruków i Zamówień
          </h1>
          <p className="text-gray-500">
            Wypełnij formularz, aby oszacować koszt i złożyć zamówienie.
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

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Sekcja 1: Dane wydruku */}
          <FormSection title="Parametry Wydruku" icon={Ruler}>
            {/* Format i Ilość */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Format Wydruku"
                name="format"
                value={formData.format}
                onChange={handleChange}
                options={FORMATS.map(f => ({ value: f.id, label: f.label }))}
                required
              />
              <InputField
                label="Ilość (szt.)"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Podaj ilość sztuk"
                required
                error={errors.quantity}
              />
            </div>

            {/* Własny Rozmiar */}
            {isCustomFormat && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg mt-4 border border-indigo-200">
                <InputField
                  label="Szerokość własna (mm)"
                  name="customWidth"
                  type="number"
                  value={formData.customWidth}
                  onChange={handleChange}
                  placeholder="np. 450"
                  required
                  error={errors.customWidth}
                />
                <InputField
                  label="Wysokość własna (mm)"
                  name="customHeight"
                  type="number"
                  value={formData.customHeight}
                  onChange={handleChange}
                  placeholder="np. 700"
                  required
                  error={errors.customHeight}
                />
              </div>
            )}

            {/* Materiał, Kolor i Długość Rolki */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <SelectField
                label="Materiał / Nośnik (wpływa na cenę)"
                name="material"
                value={formData.material}
                onChange={handleChange}
                options={materialOptions}
                required
              />

              {/* Opcja Koloru */}
              <SelectField
                label="Opcja Koloru (Mnożnik)"
                name="colorOption"
                value={formData.colorOption}
                onChange={handleChange}
                options={colorOptions}
                required
              />


              <SelectField
                label="Mnożnik Długości (Druk z rolki)"
                name="printLengthMultiplier"
                value={formData.printLengthMultiplier}
                onChange={handleChange}
                options={lengthMultiplierOptions}
                required
              />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Załącz plik (max. 10MB)
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                accept=".dwg,.dxf,.pdf,.jpg,.jpeg,.jpe,.png,.bmp,.tiff,.ifc,.xcf,.doc,.xls"
                className="block w-full text-sm text-gray-600 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition duration-150"
                
              />
              {formData.file && !errors.file && (
                <p className="mt-2 text-xs text-gray-500">
                  Wybrany plik: **{formData.file.name}** ({Math.round(formData.file.size / 1024)} KB)
                </p>
              )}
              {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
            </div>
            </div>

             {/* Sekcja Wykończenia (zakomentowana) */}

          </FormSection>

          {/* Sekcja 2: Dane Kontaktowe i Plik */}
          <FormSection title="Dane Kontaktowe i Plik" icon={Layers}>
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
                maxLength={9}
                icon={Phone}
                error={errors.phone}
              />
              <InputField
                label="NIP"
                name="NIP"
                value={formData.NIP}
                onChange={handleChange}
                placeholder="np. 1234567890"
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
                maxLength={9}
                icon={User}
                error={errors.REGON}
              />
                {/* InPost Map Button */}
                <div className="mb-4 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setShowInpostMap(true)}
                    aria-label="Wybierz paczkomat InPost"
                    className="w-full h-[4.5vh] rounded-md text-left font-semibold text-indigo-700 border border-indigo-200 bg-white hover:bg-indigo-50 transition duration-200 shadow-sm relative bottom-0 flex items-center gap-3 px-3"
                  >
                    <Mail className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    <span>Wybierz paczkomat InPost</span>
                  </button>
                </div>
              </div>
              {/* Informacja: domyślny odbiór osobisty jeśli brak wyboru paczkomatu */}
              {!formData.PACZKOMAT && (
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-5">
                  <Info className="h-5 w-5"></Info>
                  <span>
                    Jeśli nie wybierzesz paczkomatu, odbiór zostanie ustawiony jako <strong>Odbiór osobisty</strong>.
                    <br/>Alfreda Jahna 5a, 54-703 Wrocław
                  </span>
                </p>
              )}
              {/* Display selected InPost paczkomat */}
              {formData.PACZKOMAT && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700">Wybrany:</p>
                  <pre className="text-xs text-gray-600 mt-1">
                    {formData.PACZKOMAT}
                    </pre>
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
              {formData.PACZKOMAT && formData.PACZKOMAT.toString().trim() !== 'Odbiór osobisty' && (
                <p className="mt-1 text-sm text-gray-700">Dostawa InPost: <strong>16,99 PLN</strong></p>
              )}
              {formData.TYPE === 'COPY' && (
                <p className="mt-1 text-sm text-gray-700">Kopia: <strong>+2,00 PLN / szt.</strong></p>
              )}
              {errors.price && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.price}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">Uwaga: cena zamówienia może wynosić minimalnie <strong>2,00&nbsp;PLN</strong>.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition duration-200 shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Archive className="w-5 h-5 animate-spin" />
                  Przekierowanie do płatności...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Złóż zamówienie i zapłać
                </>
              )}
            </button>
          </div>
        </form>
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
                <div className="absolute inset-0">
                  <div ref={inpostContainerRef} className="h-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Print_pricing;