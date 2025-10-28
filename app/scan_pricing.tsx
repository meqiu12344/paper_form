"use client";

import React, { useState, useMemo } from "react";
import { Archive, Layers, Ruler, Mail, Phone, User, Send, Check } from "lucide-react";

// --- INTERFEJSY (INTERFACES) ---
interface ScanFormData {
  format: string;
  quantity: number;
  name: string;
  email: string;
  phone: string;
  file: File | null; // Pole file
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

interface ScanPriceItem {
    id: string;
    label: string;
    dimensions: string; // Wymiar w mm
    price_pln_netto: number; // Cena netto za 1 szt.
}


// --- DANE (DATA - CENNIK SKANOWANIA Z OBRAZU) ---

const SCAN_FORMATS: ScanPriceItem[] = [
    { id: "A4", label: "A4", dimensions: "297x210 mm", price_pln_netto: 0.20 },
    { id: "A3", label: "A3", dimensions: "420x297 mm", price_pln_netto: 0.40 },
    { id: "A2", label: "A2", dimensions: "594x420 mm", price_pln_netto: 2.60 },
    { id: "A1", label: "A1", dimensions: "841x594 mm", price_pln_netto: 5.20 },
    { id: "A0", label: "A0", dimensions: "1189x841 mm", price_pln_netto: 9.80 },
    { id: "A0_PLUS", label: "A0+", dimensions: "1292x914 mm", price_pln_netto: 10.80 },
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
    quantity: 1,
    name: "",
    email: "",
    phone: "",
    file: null,
  };

  const [formData, setFormData] = useState<ScanFormData>(initialData);
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Imię i nazwisko jest wymagane.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Wprowadź poprawny adres e-mail.";
    }
    if (formData.quantity < 1) newErrors.quantity = "Ilość musi być większa niż 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePrice = useMemo(() => {
    const quantity = formData.quantity || 1;
    const selectedFormat = SCAN_FORMATS.find(f => f.id === formData.format);

    const basePricePerUnit = selectedFormat ? selectedFormat.price_pln_netto : 0;

    // Całkowita cena netto: Cena jednostkowa * Ilość
    const totalPriceNetto = basePricePerUnit * quantity;

    return totalPriceNetto.toFixed(2);
  }, [formData.format, formData.quantity]);

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
        text: `Zamówienie na skanowanie zostało pomyślnie wysłane. Szacowany koszt netto: ${calculatePrice} PLN. Skontaktujemy się w celu potwierdzenia.`,
      });
      // setFormData(initialData); // Opcjonalne: resetowanie formularza
    }, 1500);
  };

  const formatOptions = SCAN_FORMATS.map(f => ({ 
      value: f.id, 
      label: `${f.label} (${f.dimensions}) - ${f.price_pln_netto.toFixed(2)} PLN netto / szt.` 
  }));
  
  const selectedFormatLabel = SCAN_FORMATS.find(f => f.id === formData.format)?.label || 'A4';

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
          <div className="mt-4 inline-block p-2 bg-green-100 rounded-lg shadow-inner">
                      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Format Skanowania"
                name="format"
                value={formData.format}
                onChange={handleChange}
                options={formatOptions}
                required
              />
              <InputField
                label="Ilość sztuk do skanowania"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder={`Ilość dokumentów w formacie ${selectedFormatLabel}`}
                required
                error={errors.quantity}
              />
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
                placeholder="+48 123 456 789"
                icon={Phone}
                error={errors.phone}
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

          {/* Sekcja: Podsumowanie i Akcja */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 pb-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-sm uppercase font-semibold">
                Szacowana cena netto:
              </p>
              <p className="text-4xl font-extrabold text-green-700">
                {calculatePrice} PLN
              </p>
              <p className="text-gray-400 text-xs mt-1">
                + obowiązujący podatek VAT
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
    </div>
  );
};

export default Scan_pricing;