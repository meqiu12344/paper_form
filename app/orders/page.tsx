"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
// Upewnij się, że supabase jest poprawnie zaimportowany i skonfigurowany
// import { supabase } from "@/lib/supabaseClient"; 
// Zakładam, że masz już prawidłową konfigurację klienta Supabase dla frontendu
import { supabase } from "@/lib/supabaseClient"; // Użyj swojego właściwego importu

interface Order {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  format: string;
  customWidth?: string;
  customHeight?: string;
  quantity: number;
  material: string;
  colorOption: string;
  printLengthMultiplier: string;
  finishes?: string;
  totalPrice: number;
  status: 'paid' | 'done' | 'pending_payment' | 'payment_failed' | string; // Dodane statusy
  fileName?: string;
  fileSizeKB?: number;
  filePath?: string; 
}

// Interfejs dla wiersza zamówienia
interface OrderRowProps {
  order: Order;
  markAsDone: (id: number) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, markAsDone }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Zaktualizowane mapowanie statusów
  const isPaid = order.status === "paid";
  const isDone = order.status === "DONE";
  const isPendingPayment = order.status === "pending_payment";
  const isReadyToProcess = isPaid || isPendingPayment; // Możesz zdecydować, które statusy traktujesz jako aktywne

  let statusText = "Nieznany";
  let statusColor = "bg-gray-100 text-gray-800";
  let StatusIcon: React.ComponentType<any> = Clock;

  if (isDone) {
      statusText = "Zrealizowane";
      statusColor = "bg-green-100 text-green-800";
      StatusIcon = CheckCircle;
  } else if (isPaid) {
      statusText = "Opłacone (Do realizacji)";
      statusColor = "bg-indigo-100 text-indigo-800";
      StatusIcon = DollarSign;
  } else if (isPendingPayment) {
      statusText = "Oczekuje na płatność";
      statusColor = "bg-amber-100 text-amber-800";
      StatusIcon = Clock;
  }

  // ✅ Nowa funkcja do pobierania pliku
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.filePath || isDownloading) return;

    setIsDownloading(true);
    try {
        // 1. Wywołanie serwerowego API w celu wygenerowania podpisanego URL
        const response = await fetch(`/api/get-download-url?id=${order.id}`);
        const data = await response.json();

        if (data.downloadUrl) {
          // 2. Użycie URL do przekierowania/otwarcia w nowej karcie
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          console.log("Generated download URL:", data.downloadUrl);
          // link.setAttribute('download', order.fileName || 'zamowienie.pdf'); // USUNIĘCIE TEGO WYMUSZA OTWARCIE W PRZEGLĄDARCE
          link.setAttribute('target', '_blank'); // DODANIE TEGO OTWIERA W NOWEJ KARCIE
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
            alert(data.error || "Nie udało się wygenerować linku do pobrania.");
        }
    } catch (error) {
        alert("Błąd połączenia z API pobierania pliku.");
        console.error("Błąd pobierania:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <>
      <tr
        key={order.id}
        className={`border-b cursor-pointer transition duration-150 ${isExpanded ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="py-3 px-4 font-medium text-indigo-700">{order.id}</td>
        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleString()}</td>
        <td className="py-3 px-4">
          <p className="font-semibold">{order.name}</p>
          <p className="text-gray-500 text-xs">{order.email}</p>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            <StatusIcon className="w-3 h-3 mr-1"/>
            {statusText}
          </span>
        </td>
        <td className="py-3 px-4 font-bold text-indigo-600">
          {order.totalPrice.toFixed(2)} PLN (netto)
        </td>
        <td className="py-3 px-4 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-1 text-gray-500 hover:text-indigo-600 transition"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-white border-b border-indigo-200">
          <td colSpan={6} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Dane Klienta</h4>
                <p><strong>Telefon:</strong> {order.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {order.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Szczegóły Wydruku</h4>
                <p><strong>Format:</strong> {order.format} (x{order.quantity})</p>
                {order.customWidth && <p><strong>Wymiary:</strong> {order.customWidth}x{order.customHeight} mm</p>}
                <p><strong>Materiał:</strong> {order.material}</p>
                <p><strong>Kolor:</strong> {order.colorOption}</p>
                <p><strong>Długość druku:</strong> {order.printLengthMultiplier}</p>
                <p><strong>Wykończenia:</strong> {order.finishes || 'Brak'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Plik i Akcja</h4>
                {order.filePath ? ( 
                  <p className="mt-2">
                    {/* ZMIENIONO: Używamy przycisku do uruchomienia funkcji handleDownload */}
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="inline-flex items-center text-blue-600 underline hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FileText className="w-4 h-4 mr-1"/> 
                      {isDownloading ? 'Generowanie linku...' : `Pobierz plik: ${order.fileName} (${order.fileSizeKB} KB)`}
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-400 mt-2">Brak załączonego pliku do pobrania.</p>
                )}

                {/* ZMIENIONO: Oznacz jako zrealizowane tylko jeśli jest opłacone */}
                {isPaid && ( 
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsDone(order.id); }}
                    className="mt-3 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs hover:bg-green-700 transition"
                  >
                    Zrealizuj zamówienie (Status "DONE")
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function PanelPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pobieranie danych z Supabase (teraz szukamy statusu 'paid')
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("Order")
        .select("*") 
        .in('status', ['paid', 'DONE', 'pending_payment', 'payment_failed']) // Pobieramy wszystkie istotne statusy
        .order("createdAt", { ascending: false }); // Sortowanie od najnowszych

      if (error) {
        console.error("Błąd pobierania zamówień:", error);
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    }

    loadOrders();
  }, []);

  // ✅ Aktualizacja statusu z 'paid' na 'DONE'
  async function markAsDone(id: number) {
    const confirmAction = confirm("Czy na pewno oznaczyć to zamówienie jako ZREALIZOWANE (DONE)?");
    if (!confirmAction) return;

    const { error } = await supabase
      .from("Order")
      .update({ status: "DONE" })
      .eq("id", id);

    if (error) {
      alert("Nie udało się zarchiwizować zamówienia ❌");
      console.error(error);
    } else {
      alert("Zamówienie zarchiwizowane ✅");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "DONE" } : o))
      );
    }
  }

  if (loading) return <p className="p-8 text-gray-500">Ładowanie zamówień...</p>;

  const paidOrders = orders.filter((o) => o.status === "paid");
  const doneOrders = orders.filter((o) => o.status === "DONE");
  const pendingOrFailedOrders = orders.filter((o) => o.status !== "paid" && o.status !== "DONE");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">📦 Panel zamówień</h1>

      <div className="text-sm text-gray-500 mb-6">
        Kliknij wiersz zamówienia, aby rozwinąć wszystkie szczegóły.
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          📝 Wszystkie zamówienia ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">Brak zamówień.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-100">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Klient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cena netto</th>
                  <th className="py-3 px-4 text-center">Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                {/* Priorytet: Opłacone, Gotowe do realizacji, a potem Zrealizowane/Inne */}
                {[...paidOrders, ...pendingOrFailedOrders, ...doneOrders].map((o) => (
                  <OrderRow key={o.id} order={o} markAsDone={markAsDone} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}