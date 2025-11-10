"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // ✅ import supabase

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
  status: string;
  fileName?: string;
  fileSizeKB?: number;
  filePath?: string;
}

const OrderRow: React.FC<{ order: Order; markAsDone: (id: number) => void }> = ({ order, markAsDone }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPending = order.status === "PENDING";
  const statusColor = isPending ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800";

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
            {isPending ? <Clock className="w-3 h-3 mr-1"/> : <CheckCircle className="w-3 h-3 mr-1"/>}
            {isPending ? "Oczekujące" : "Zrealizowane"}
          </span>
        </td>
        <td className="py-3 px-4 font-bold text-indigo-600">
          {order.totalPrice.toFixed(2)} PLN
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
                {order.customWidth && <p><strong>Wymiary:</strong> {order.customWidth}x{order.customHeight}</p>}
                <p><strong>Materiał:</strong> {order.material}</p>
                <p><strong>Kolor:</strong> {order.colorOption}</p>
                <p><strong>Długość druku:</strong> {order.printLengthMultiplier}</p>
                <p><strong>Wykończenia:</strong> {order.finishes || 'Brak'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Plik i Akcja</h4>
                {order.filePath ? (
                  <p className="flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-blue-600"/> 
                    <a href={order.filePath} download className="text-blue-600 underline hover:text-blue-800">
                      Pobierz plik: {order.fileName} ({order.fileSizeKB} KB)
                    </a>
                  </p>
                ) : (
                  <p className="text-gray-400">Brak pliku</p>
                )}
                {isPending && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsDone(order.id); }}
                    className="mt-3 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs hover:bg-green-700 transition"
                  >
                    Zrealizuj zamówienie
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

  // ✅ Pobieranie danych z Supabase
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("Order")
        .select("*")
        .order("createdAt");

      console.log("Pobrane zamówienia:", data);
      console.log("Błąd pobierania zamówień:", error);

      if (error) {
        console.error("Błąd pobierania zamówień:", error);
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    }

    loadOrders();
  }, []);

  // ✅ Aktualizacja statusu w Supabase
  async function markAsDone(id: number) {
    const confirmAction = confirm("Czy na pewno oznaczyć to zamówienie jako zrealizowane?");
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

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const doneOrders = orders.filter((o) => o.status === "DONE");

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
                  <th className="py-3 px-4">Cena</th>
                  <th className="py-3 px-4 text-center">Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                {[...pendingOrders, ...doneOrders].map((o) => (
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
