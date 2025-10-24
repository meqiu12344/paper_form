import Hero from "./Hero"; // klient
import DlaczegoMy from "./DlaczegoMy"; // klient
import AppForm from "./AppForm"; // klient
import LoadingScreen from "./LoadingScreen"; // klient

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
      <DlaczegoMy />
      <section id="formularz" className="py-24 px-6 max-w-6xl m-auto">
        <AppForm />
      </section>
      {/* Polityka i regulamin */}
    </main>
  );
}
