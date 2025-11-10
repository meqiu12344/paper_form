"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"sending" | "success" | "error">("sending");

  useEffect(() => {
    const sendOrder = async () => {
      try {
        const stored = sessionStorage.getItem("orderFormData");
        if (!stored) throw new Error("Brak danych zamówienia w pamięci przeglądarki.");

        const formData = new FormData();
        
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          formData.append(key, value as any);
          console.log(key, value)
        });

        const res = await fetch("/api/submit", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Błąd zapisu zamówienia.");
        const data = await res.json();
        if (!data.success) throw new Error("Serwer nie zapisał zamówienia.");

        // 🟢 Sukces — wyczyść dane i przekieruj
        sessionStorage.removeItem("orderFormData");
        setStatus("success");
        setTimeout(() => router.push("/success"), 1000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    sendOrder();
  }, [router]);

  if (status === "sending") {
    return (
      <div className="p-12 text-center text-lg">
        Zapisywanie zamówienia w bazie...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-12 text-center text-red-600">
        <h1 className="text-2xl font-bold mb-2">❌ Wystąpił błąd</h1>
        <p>Nie udało się zapisać zamówienia. Spróbuj ponownie.</p>
      </div>
    );
  }

  return (
    <div className="p-12 text-center text-green-600">
      <h1 className="text-2xl font-bold mb-2">✅ Zamówienie zapisane</h1>
      <p>Za chwilę zostaniesz przekierowany na stronę podsumowania...</p>
    </div>
  );
}
