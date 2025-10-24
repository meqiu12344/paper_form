"use client";

import React, { useState, useMemo } from "react";
import { Archive, Layers, Ruler, Mail, Phone, User, Send } from "lucide-react";
import "tailwindcss";

// --- DANE ---
const FORMATS = [
  { name: "A0 (84.1 x 118.9 cm)", width: 84.1, height: 118.9 },
  { name: "A1 (59.4 x 84.1 cm)", width: 59.4, height: 84.1 },
  { name: "A2 (42 x 59.4 cm)", width: 42.0, height: 59.4 },
  { name: "B1 (70 x 100 cm)", width: 70.0, height: 100.0 },
  { name: "Wymiary Niestandardowe", width: 0, height: 0 },
];

const MATERIALS = [
  { id: "paper", name: "Papier Plakatowy 200g", multiplier: 1.0 },
  { id: "canvas", name: "Płótno Canvas 350g", multiplier: 3.5 },
  { id: "banner", name: "Baner Laminowany 510g", multiplier: 1.8 },
  { id: "foil", name: "Folia Samoprzylepna Monomeryczna", multiplier: 2.2 },
];

const FINISHES = [
  { id: "lamination", name: "Laminowanie matowe/błysk", price_per_sqm: 15.0 },
  { id: "eyelets", name: "Oczkowanie (banery)", price_per_unit: 0.5 },
  { id: "cutting", name: "Cięcie do formatu", price_per_sqm: 5.0 },
];

const BASE_PRICE_PER_SQM = 40.0; // PLN/m²

// --- Komponenty pomocnicze ---
const FormSection = ({ title: any, icon: Icon, children }) => (
  <section className="mb-8 p-6 bg-white shadow-sm rounded-2xl transition hover:shadow-md">
    <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center text-indigo-700 border-b pb-2 border-indigo-100">
      <Icon className="w-5 h-5 mr-2 text-indigo-500" />
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </section>
);

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  error,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`block w-full pl-9 pr-3 py-2.5 border text-sm rounded-xl focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-indigo-400"
        }`}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false }) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full pl-3 pr-8 py-2.5 border text-sm border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none bg-white"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%236366f1' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/></svg>")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.8rem center",
          backgroundSize: "14px 14px",
        }}
      >
        {options.map((option, index) => (
          <option key={index} value={option.id || option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// --- Główny komponent ---
const AppForm = () => {
  const [formData, setFormData] = useState({
    format: FORMATS[0].name,
    customWidth: "",
    customHeight: "",
    quantity: 1,
    material: MATERIALS[0].id,
    finishes: [],
    name: "",
    email: "",
    phone: "",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Kalkulacja ceny
  const calculatePrice = useMemo(() => {
    let width_cm, height_cm, quantity;
    if (formData.format === "Wymiary Niestandardowe") {
      width_cm = parseFloat(formData.customWidth) || 0;
      height_cm = parseFloat(formData.customHeight) || 0;
    } else {
      const selectedFormat = FORMATS.find((f) => f.name === formData.format);
      width_cm = selectedFormat?.width || 0;
      height_cm = selectedFormat?.height || 0;
    }
    quantity = parseInt(formData.quantity) || 0;
    const area_sqm = (width_cm / 100) * (height_cm / 100);
    const material = MATERIALS.find((m) => m.id === formData.material);
    const printCost = area_sqm * BASE_PRICE_PER_SQM * (material?.multiplier || 1);
    let finishCost = 0;
    formData.finishes.forEach((f) => {
      const finish = FINISHES.find((x) => x.id === f);
      if (finish?.price_per_sqm) finishCost += area_sqm * finish.price_per_sqm;
      else if (finish?.price_per_unit) finishCost += 4 * finish.price_per_unit;
    });
    const total = (printCost + finishCost) * quantity;
    return total > 0 ? total.toFixed(2) : "---";
  }, [formData]);

  // Obsługa zmian
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        finishes: checked
          ? [...prev.finishes, name]
          : prev.finishes.filter((f) => f !== name),
      }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Walidacja
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Wpisz swoje imię lub nazwę firmy.";
    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
      newErrors.email = "Podaj poprawny adres e-mail.";

    if (!/^\\+?(\\d.*){9,15}$/.test(formData.phone))
      newErrors.phone = "Podaj poprawny numer telefonu.";
    if (
      formData.format === "Wymiary Niestandardowe" &&
      (!parseFloat(formData.customWidth) || !parseFloat(formData.customHeight))
    ) {
      newErrors.customWidth = "Podaj poprawne wymiary.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Obsługa wysyłki
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setSubmissionMessage({
        type: "error",
        text: "Proszę poprawić błędy w formularzu.",
      });
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSubmissionMessage({
      type: "success",
      text: `Dziękujemy! Szacowana cena: ${calculatePrice} PLN netto.`,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {submissionMessage && (
        <div
          className={`p-3 mb-6 text-sm rounded-xl ${
            submissionMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submissionMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection title="1. Wymiary i Ilość" icon={Ruler}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              options={FORMATS}
              required
            />
            <InputField
              label="Ilość"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              icon={Layers}
              required
            />
          </div>

          {formData.format === "Wymiary Niestandardowe" && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <InputField
                label="Szerokość (cm)"
                name="customWidth"
                type="number"
                value={formData.customWidth}
                onChange={handleChange}
                icon={Ruler}
                required
              />
              <InputField
                label="Wysokość (cm)"
                name="customHeight"
                type="number"
                value={formData.customHeight}
                onChange={handleChange}
                icon={Ruler}
                required
              />
            </div>
          )}
        </FormSection>

        <FormSection title="2. Materiał i Wykończenie" icon={Archive}>
          <SelectField
            label="Materiał"
            name="material"
            value={formData.material}
            onChange={handleChange}
            options={MATERIALS}
            required
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FINISHES.map((f) => (
              <label key={f.id} className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  name={f.id}
                  checked={formData.finishes.includes(f.id)}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-400"
                />
                {f.name}
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection title="3. Dane kontaktowe" icon={Mail}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Imię i nazwisko / Firma"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
              error={errors.name}
            />
            <InputField
              label="E-mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
              error={errors.email}
            />
            <InputField
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              required
              error={errors.phone}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Załącz plik
            </label>
            <input
              type="file"
              onChange={handleChange}
              className="block w-full text-sm text-gray-600 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </FormSection>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <div className="text-center sm:text-left">
            <p className="text-gray-500 text-xs uppercase font-semibold">
              Szacowana cena netto:
            </p>
            <p className="text-2xl font-bold text-indigo-700">
              {calculatePrice} PLN
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition disabled:opacity-70"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppForm;
