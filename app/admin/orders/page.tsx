// app/admin/orders/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Dla każdego zamówienia stwórz signed URL jeśli jest file_path
  const ordersWithUrls = await Promise.all(orders.map(async (o) => {
    if (!o.file_path) return { ...o, downloadUrl: null };
    // signed URL na 1h
    const { data } = await supabaseAdmin.storage.from("uploads").createSignedUrl(o.file_path, 60 * 60);
    return { ...o, downloadUrl: data?.signedURL || null };
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Zamówienia</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th>Data</th>
              <th>Imię</th>
              <th>E-mail</th>
              <th>Format</th>
              <th>Ilość</th>
              <th>Cena (netto)</th>
              <th>Plik</th>
            </tr>
          </thead>
          <tbody>
            {ordersWithUrls.map(o => (
              <tr key={o.id} className="border-t">
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>{o.name}</td>
                <td>{o.email}</td>
                <td>{o.format}</td>
                <td>{o.quantity}</td>
                <td>{o.calculated_price} PLN</td>
                <td>
                  {o.downloadUrl ? (
                    <a href={o.downloadUrl} target="_blank" rel="noreferrer" className="text-indigo-600">Pobierz</a>
                  ) : (
                    <span className="text-gray-400">Brak</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
