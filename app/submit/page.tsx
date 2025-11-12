// /app/submit/page.tsx (lub pages/submit.tsx)
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Dla App Router
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

// Inicjalizacja klienta Supabase dla operacji na stronie (Anon Key)
// Pamiętaj, aby polityka RLS dla tabeli Order pozwalała na ODCZYT statusu zamówienia
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OrderStatus {
    status: 'loading' | 'success' | 'failure';
    message: string;
    orderId: string | null;
}

const SubmitPage: React.FC = () => {
    const searchParams = useSearchParams(); // Użyj useRouter/query, jeśli Pages Router
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    const [status, setStatus] = useState<OrderStatus>({
        status: 'loading',
        message: 'Weryfikacja płatności i zamówienia...',
        orderId: orderId,
    });

    useEffect(() => {
        if (!sessionId || !orderId) {
            setStatus({
                status: 'failure',
                message: 'Brak wymaganych parametrów sesji. Transakcja nie może być zweryfikowana.',
                orderId: null,
            });
            return;
        }

        const verifyPayment = async () => {
            try {
                // Endpoint API do weryfikacji sesji Stripe i aktualizacji bazy danych
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, orderId }),
                });

                const data = await response.json();

                if (data.verified) {
                    setStatus({
                        status: 'success',
                        message: `Płatność zakończona sukcesem! Twoje zamówienie **#${orderId}** zostało przyjęte do realizacji. Potwierdzenie wysłano na Twój e-mail.`,
                        orderId: orderId,
                    });
                } else {
                    throw new Error(data.error || 'Weryfikacja płatności nie powiodła się.');
                }
            } catch (error: any) {
                console.error("Błąd weryfikacji płatności:", error);
                setStatus({
                    status: 'failure',
                    message: `Wystąpił błąd podczas weryfikacji płatności: ${error.message}. Proszę o kontakt podając ID zamówienia **#${orderId}**.`,
                    orderId: orderId,
                });
            }
        };

        verifyPayment();
    }, [sessionId, orderId]);

    const Icon = status.status === 'success' ? CheckCircle : status.status === 'failure' ? XCircle : Loader;
    const color = status.status === 'success' ? 'text-green-500' : status.status === 'failure' ? 'text-red-500' : 'text-indigo-500';
    const bgColor = status.status === 'success' ? 'bg-green-50' : status.status === 'failure' ? 'bg-red-50' : 'bg-indigo-50';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className={`max-w-xl w-full p-8 rounded-xl shadow-2xl text-center transition duration-500 ${bgColor}`}>
                <Icon className={`w-16 h-16 mx-auto mb-6 ${color} ${status.status === 'loading' ? 'animate-spin' : ''}`} />
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                    {status.status === 'success' ? 'Zamówienie Złożone!' : status.status === 'failure' ? 'Błąd Transakcji' : 'Weryfikacja...'}
                </h1>
                <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: status.message }}></p>
                
                {status.orderId && (
                    <p className="text-sm font-semibold text-gray-700">
                        ID Zamówienia: <span className="text-indigo-600">{status.orderId}</span>
                    </p>
                )}

                <div className="mt-8 space-y-4">
                    <a 
                        href="/" 
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition duration-150"
                    >
                        Wróć na stronę główną
                    </a>
                    {status.orderId && (
                        <a 
                            href={`mailto:${status.orderId}`} // Zmień na swój adres e-mail
                            className="inline-flex items-center justify-center w-full px-6 py-3 border border-indigo-500 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition duration-150"
                        >
                            Skontaktuj się w sprawie zamówienia
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitPage;