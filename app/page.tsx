import Hero from "./components/Hero"; // klient
import LoadingScreen from "./components/LoadingScreen"; // klient
import Why_us from "./components/why_us";
import Print_pricing from "./components/print_pricing";
import Scan_pricing from "./components/scan_pricing";
import Copy_pricing from "./components/copy_pricing";
// Import nowego komponentu klienckiego
import PrivacyPopup from "./components/PrivacyPopup"; 

export const metadata = {
  title: "Drukarnia XYZ | Druk Wielkoformatowy i Reklamowy na Zamówienie",
  description:
    "Drukarnia XYZ – profesjonalny druk wielkoformatowy, plakaty, banery, folie i płótna reklamowe. Darmowa wycena online, ekspresowa realizacja i dostawa w 24h.",
};

export default function Page() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 text-gray-800 relative overflow-hidden">
        <LoadingScreen />
        <Hero />
        <Why_us />
        <section id="formularz-drukowania" className="">
          <Print_pricing />
        </section>
        <section id="formularz-skanowania" className="">
          <Scan_pricing />
        </section>
        <section id="formularz-kopii" className="">
          <Copy_pricing />
        </section>
        {/* Polityka i regulamin */}
      </main>
      
      {/* Dodany komponent z przyciskiem zamykającym */}
      <PrivacyPopup />
    </>
  );
}