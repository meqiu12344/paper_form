"use client";

import React, { useState, useMemo } from "react";
import { Archive, Layers, Ruler, Mail, Phone, User, Send, Check } from "lucide-react";

// --- INTERFACES ---
interface FormData {
  format: string;
  customWidth: string;
  customHeight: string;
  quantity: number;
  material: string; // ID of the material/carrier
  colorOption: string; // ID of the color option (NEW)
  printLengthMultiplier: string; // Multiplier for print from roll
  finishes: string[];
  name: string;
  email: string;
  phone: string;
  file: File | null;
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
  { id: "STANDARD_80", label: "Rys. Techniczny / Papier standardowy 80g/m²", price_multiplier: 1.0 }, // CENA = x1
  { id: "COATED_180", label: "Plakat / Papier powlekany 180g/m²", price_multiplier: 2.0 }, // CENA = x2
  { id: "PHOTO_SATIN", label: "Fotografia / Papier fotograficzny Satyna/Perła 260g/m²", price_multiplier: 3.0 }, // Przyjmuję x3 na podstawie ceny PLAKAT A0/P.KOLOR A0 vs CAD A0
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
  { id: "1", label: "DRUK CZARNO-BIAŁY, DO 10% POW. ZADRUKU", multiplier: 1.0 },
  { id: "2", label: "DRUK CZARNO-BIAŁY, DO 50% POW. ZADRUKU", multiplier: 2.0 }, // Lekko zwiększam mnożnik względem 1.0 dla opcji Monochromatycznej
  { id: "3", label: "DRUK CZARNO-BIAŁY, PONAD 50% POW. ZADRUKU", multiplier: 3.0 },
  { id: "4", label: "DRUK KOLOROWY, DO 10% POW. ZADRUKU", multiplier: 2.0 },
  { id: "5", label: "DRUK KOLOROWY, DO 50% POW. ZADRUKU", multiplier: 3.0 },
  { id: "6", label: "DRUK KOLOROWY, PONAD 50% POW. ZADRUKU", multiplier: 4.0 },
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

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", value, onChange, placeholder, icon: Icon, required = false, error }) => (
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
    colorOption: "MONO", // Default value
    printLengthMultiplier: "x1",
    finishes: [],
    name: "",
    email: "",
    phone: "",
    file: null,
  };

  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<SubmissionMessage | null>(null);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newFinishes = checked
        ? [...prev.finishes, value]
        : prev.finishes.filter(f => f !== value);
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
      if (!formData.customWidth || parseInt(formData.customWidth, 10) <= 0) newErrors.customWidth = "Podaj poprawną szerokość.";
      if (!formData.customHeight || parseInt(formData.customHeight, 10) <= 0) newErrors.customHeight = "Podaj poprawną wysokość.";
    }
    if (formData.quantity < 1) newErrors.quantity = "Ilość musi być większa niż 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePrice = useMemo(() => {
    const quantity = formData.quantity || 1;
    const selectedFormat = FORMATS.find(f => f.id === formData.format);
    const selectedMaterial = MATERIALS.find(m => m.id === formData.material);
    const selectedLengthMultiplier = LENGTH_MULTIPLIERS.find(l => l.id === formData.printLengthMultiplier);
    const selectedColorOption = COLOR_OPTIONS.find(c => c.id === formData.colorOption); // NEW: Color option

    let basePricePerUnit = 0;

    if (selectedFormat && selectedFormat.id !== 'CUSTOM') {
      basePricePerUnit = selectedFormat.price_pln_netto;
    } else if (formData.format === 'CUSTOM' && formData.customWidth && formData.customHeight) {
      // PROSTA HEURYSTYKA DLA CENY WŁASNEJ: OBLICZENIE CENY NA PODSTAWIE STOSUNKU POWIERZCHNI DO CENY A4
      const customWidth = parseFloat(formData.customWidth) / 1000; // m
      const customHeight = parseFloat(formData.customHeight) / 1000; // m
      const customArea = customWidth * customHeight; // m2

      // Używamy A0 jako bazy dla dużych formatów (A0 ma 1.0 m2 i kosztuje 12.20 PLN netto)
      const A0_AREA = FORMATS.find(f => f.id === 'A0')!.width * FORMATS.find(f => f.id === 'A0')!.height / 1000000; // ~1.0 m2
      const A0_PRICE = FORMATS.find(f => f.id === 'A0')!.price_pln_netto;

      // Cena za m2 na podstawie A0
      const pricePerM2 = A0_PRICE / A0_AREA; // ~12.20 PLN/m2
      basePricePerUnit = customArea * pricePerM2;

      // Upewnienie się, że minimalna cena to cena A4
      basePricePerUnit = Math.max(basePricePerUnit, FORMATS.find(f => f.id === 'A4')!.price_pln_netto);
    }

    if (basePricePerUnit === 0) {
      return "0.00";
    }

    const materialMultiplier = selectedMaterial ? selectedMaterial.price_multiplier : 1.0;
    const lengthMultiplier = selectedLengthMultiplier ? selectedLengthMultiplier.multiplier : 1.0;
    const colorMultiplier = selectedColorOption ? selectedColorOption.multiplier : 1.0; // NEW: Color multiplier

    // Cena jednostkowa = Cena bazowa * Mnożnik materiału * Mnożnik długości * Mnożnik Koloru
    const unitPrice = basePricePerUnit * materialMultiplier * lengthMultiplier * colorMultiplier;

    // Całkowita cena netto
    const totalPriceNetto = unitPrice * quantity;

    return totalPriceNetto.toFixed(2);
  }, [formData.format, formData.customWidth, formData.customHeight, formData.quantity, formData.material, formData.printLengthMultiplier, formData.colorOption]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) {
      setMessage({ type: 'error', text: "Proszę poprawić błędy w formularzu przed wysłaniem." });
      return;
    }

    setIsSubmitting(true);

    // Symulacja wysyłki danych do API/Serwera
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage({
        type: 'success',
        text: `Zamówienie zostało pomyślnie wysłane. Szacowany koszt netto: ${calculatePrice} PLN. Skontaktujemy się w celu potwierdzenia.`,
      });
      // setFormData(initialData); // Opcjonalne: resetowanie formularza
    }, 1500);
  };

  const materialOptions = MATERIALS.map(m => ({ value: m.id, label: m.label }));
  const lengthMultiplierOptions = LENGTH_MULTIPLIERS.map(l => ({ value: l.id, label: l.label }));
  const colorOptions = COLOR_OPTIONS.map(c => ({ value: c.id, label: c.label })); // NEW: Color options

  // Sprawdzamy, czy wybrany format to duży format (A0, A0+, B0, B1) aby umożliwić wybór mnożnika długości
  const isLargeFormat = ['A0', 'A0_PLUS', 'B0', 'B1'].includes(formData.format);
  const isCustomFormat = formData.format === 'CUSTOM';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
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

        <form action='https://formspree.io/f/xqagpgpd' method="Post" className="space-y-6">
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

            </div>

            {/* <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uszlachetnienie / Wykończenie (opcjonalnie)
                </label>
                <div className="flex flex-wrap gap-4">
                    {["Laminowanie Mat", "Laminowanie Błysk", "Oprawa"].map(finish => (
                        <label key={finish} className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name="finishes"
                                value={finish}
                                checked={formData.finishes.includes(finish)}
                                onChange={handleCheckboxChange}
                                className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150"
                            />
                            <span className="ml-2 text-sm text-gray-700">{finish}</span>
                        </label>
                    ))}
                </div>
            </div> */}

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
                placeholder="+48 123 456 789"
                icon={Phone}
                error={errors.phone}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Załącz plik (max. 10MB)
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="block w-full text-sm text-gray-600 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition duration-150"
                
              />
              {formData.file && (
                <p className="mt-2 text-xs text-gray-500">
                  Wybrany plik: **{formData.file.name}** ({Math.round(formData.file.size / 1024)} KB)
                </p>
              )}
            </div>
          </FormSection>

          {/* Sekcja: Podsumowanie i Akcja */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 pb-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-sm uppercase font-semibold">
                Szacowana cena netto:
              </p>
              <p className="text-4xl font-extrabold text-indigo-700">
                {calculatePrice} PLN
              </p>
              <p className="text-gray-400 text-xs mt-1">
                + obowiązujący podatek VAT
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 transition duration-200 shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Archive className="w-5 h-5 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Złóż zamówienie
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Print_pricing;
