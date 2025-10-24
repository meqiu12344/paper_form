import './globals.css'; // <-- KLUCZOWY IMPORT STYLÓW
import { Inter } from 'next/font/google';

// Konfiguracja czcionki Inter (zalecana w Tailwind)
// Next.js automatycznie ładuje fonty dla optymalizacji
const inter = Inter({ subsets: ['latin'] });

// Obiekt Metadanych dla SEO
export const metadata = {
  title: 'Druk Wielkoformatowy Online - Kalkulator Cen i Wymiarów | [Twoja Marka]',
  description: 'Zamów wydruk wielkoformatowy (A0, A1, B1, niestandardowe). Użyj prostego kalkulatora do wyceny i przesłania pliku online. Szybka realizacja, wysoka jakość.',
};

export default function RootLayout({ children }) {
  return (
    // Upewniamy się, że czcionka i język są ustawione
    <html lang="pl">
      {/* Dodanie klasy czcionki do body dla globalnego użycia */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
