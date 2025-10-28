import Hero from "./Hero"; // klient
import LoadingScreen from "./LoadingScreen"; // klient
import Why_us from "./why_us";
import Print_pricing from "./print_pricing";
import Scan_pricing from "./scan_pricing";

export const metadata = {
  title: "Drukarnia XYZ | Druk Wielkoformatowy i Reklamowy na Zamówienie",
  description:
    "Drukarnia XYZ – profesjonalny druk wielkoformatowy, plakaty, banery, folie i płótna reklamowe. Darmowa wycena online, ekspresowa realizacja i dostawa w 24h.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 relative overflow-hidden">
      <LoadingScreen />
      <Hero />
      <Why_us />
      <section id="formularz-drukowania" className="">
        <Print_pricing />
      </section>
      <section id="formilarz-skanowania" className="">
        <Scan_pricing />
      </section>
      {/* Polityka i regulamin */}
    </main>
  );
}
