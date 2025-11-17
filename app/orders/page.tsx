"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle, Clock, DollarSign, LogIn, Lock, User, Printer, Scan } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
    status: 'paid' | 'done' | 'pending_payment' | 'payment_failed' | string;
    fileName?: string;
    fileSizeKB?: number;
    filePath?: string;
    NIP: string;
    REGON: string;
    TYPE: 'PRINT' | 'SCAN' | string;
    PACZKOMAT?: string;
}

interface OrderRowProps {
    order: Order;
    markAsDone: (id: number) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, markAsDone }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const isPaid = order.status === "paid";
    // Zmieniono na wielkie litery, żeby pasowało do tego, jak zapisywane jest w bazie
    const isDone = order.status === "DONE";
    const isPendingPayment = order.status === "pending_payment";

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
    // ✅ Dodatkowa logika dla statusu payment_failed
    else if (order.status === "payment_failed") {
        statusText = "Płatność nieudana";
        statusColor = "bg-red-100 text-red-800";
        StatusIcon = Lock;
    }

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!order.filePath || isDownloading) return;

        setIsDownloading(true);
        try {
            // Używamy API route do bezpiecznego pobrania URL
            const response = await fetch(`/api/get-download-url?id=${order.id}`);
            const data = await response.json();

            if (data.downloadUrl) {
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.setAttribute('target', '_blank');
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
                {/* ✅ DODANY TYP ZAMÓWIENIA W WIDOKU GŁÓWNYM */}
                <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.TYPE === 'PRINT' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        {order.TYPE === 'PRINT' ? <Printer className="w-3 h-3 mr-1" /> : <Scan className="w-3 h-3 mr-1" />}
                        {order.TYPE === 'PRINT' ? 'Druk' : 'Skan'}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
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
                    <td colSpan={7} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">Dane Klienta</h4>
                                <p><strong>Telefon:</strong> {order.phone || 'N/A'}</p>
                                <p><strong>Email:</strong> {order.email}</p>
                                <p><strong>NIP:</strong> {order.NIP || 'N/A'}</p>
                                <p><strong>REGON:</strong> {order.REGON || 'N/A'}</p>
                                <p><strong>Adres Paczkomatu:</strong>{ order.PACZKOMAT || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">Szczegóły {order.TYPE === 'PRINT' ? 'Druku' : 'Skanu'}</h4>
                                <p><strong>Format:</strong> {order.format} (x{order.quantity})</p>
                                {order.customWidth && <p><strong>Wymiary:</strong> {order.customWidth}x{order.customHeight} mm</p>}
                                <p><strong>Materiał:</strong> {order.material || 'N/A'}</p>
                                <p><strong>Kolor:</strong> {order.colorOption || 'N/A'}</p>
                                <p><strong>Długość druku:</strong> {order.printLengthMultiplier || 'N/A'}</p>
                                <p><strong>Wykończenia:</strong> {order.finishes || 'Brak'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">Plik i Akcja</h4>
                                {order.filePath ? (
                                    <p className="mt-2">
                                        <button
                                            onClick={handleDownload}
                                            disabled={isDownloading}
                                            className="inline-flex items-center text-blue-600 underline hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <FileText className="w-4 h-4 mr-1" />
                                            {isDownloading ? 'Generowanie linku...' : `Pobierz plik: ${order.fileName} (${order.fileSizeKB} KB)`}
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-gray-400 mt-2">Brak załączonego pliku do pobrania.</p>
                                )}

                                {isPaid && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); markAsDone(order.id); }}
                                        className="mt-3 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs hover:bg-green-700 transition disabled:opacity-50"
                                        disabled={!isPaid} // Upewniamy się, że można zrealizować tylko opłacone
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

// ----------------------------------------------------------------------------------
// ZMODYFIKOWANY KOMPONENT PANELPAGE Z PODZIAŁEM NA TYP
// ----------------------------------------------------------------------------------

export default function PanelPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    // Stany dla autoryzacji
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");

    const loadOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("Order")
            .select("*")
            .in('status', ['paid', 'DONE', 'pending_payment', 'payment_failed'])
            .order("createdAt", { ascending: false });

        if (error) {
            console.error("Błąd pobierania zamówień:", error);
        } else {
            setOrders(data as Order[]);
        }
        setLoading(false);
    }, []);

    // Ładowanie zamówień tylko jeśli zalogowany
    useEffect(() => {
        if (isLoggedIn) {
            loadOrders();
        }
    }, [isLoggedIn, loadOrders]);

    async function markAsDone(id: number) {
        if (!isLoggedIn) return; // Zabezpieczenie

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

    // Funkcja Logowania (symulacja)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAuthError("");

        try {
            const response = await fetch('/api/verify-admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                setIsLoggedIn(true);
                setAuthError("");
            } else {
                setAuthError(data.error || "Nieprawidłowy login lub hasło.");
            }

        } catch (error) {
            console.error("Błąd logowania:", error);
            setAuthError("Błąd połączenia z serwerem autoryzacji.");
        } finally {
            setLoading(false);
        }
    };

    // WIDOK LOGOWANIA
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                    <div className="text-center mb-6">
                        <Lock className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-gray-800">Panel Administracyjny</h2>
                        <p className="text-gray-500">Wprowadź dane logowania, aby kontynuować.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nazwa użytkownika</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="admin"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Hasło / PIN</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {authError && (
                            <div className="text-red-500 text-sm text-center font-medium">{authError}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            {loading ? 'Logowanie...' : 'Zaloguj się'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ✅ FILTROWANIE ZAMÓWIEŃ WEDŁUG TYPU
    const printOrders = orders.filter((o) => o.TYPE === 'PRINT');
    const scanOrders = orders.filter((o) => o.TYPE === 'SCAN');

    // Funkcja pomocnicza do renderowania tabeli
    const renderOrderTable = (orderList: Order[], title: string, Icon: React.ComponentType<any>, type: 'PRINT' | 'SCAN') => {
        // Sortowanie: Opłacone > Oczekujące/Nieudane > Zrealizowane
        const sortedOrders = [...orderList].sort((a, b) => {
            if (a.status === 'paid' && b.status !== 'paid') return -1;
            if (a.status !== 'paid' && b.status === 'paid') return 1;
            if (a.status === 'DONE' && b.status !== 'DONE') return 1;
            if (a.status !== 'DONE' && b.status === 'DONE') return -1;
            // Dodatkowo sortowanie po dacie (najnowsze na górze)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return (
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-indigo-600" />
                    {title} ({orderList.length})
                </h2>

                {orderList.length === 0 ? (
                    <p className="text-gray-500 bg-white p-4 rounded-xl shadow-md">Brak zamówień typu {type === 'PRINT' ? 'druku' : 'skanu'}.</p>
                ) : (
                    <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-100">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-indigo-100">
                                <tr>
                                    <th className="py-3 px-4">ID</th>
                                    <th className="py-3 px-4">Data</th>
                                    <th className="py-3 px-4">Klient</th>
                                    <th className="py-3 px-4">Typ</th> {/* ✅ Nowa kolumna */}
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Cena netto</th>
                                    <th className="py-3 px-4 text-center">Szczegóły</th>
                                    <th className="py-3 px-4">Paczkomat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrders.map((o) => (
                                    <OrderRow key={o.id} order={o} markAsDone={markAsDone} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        );
    };

    // WIDOK PANELU (TYLKO DLA ZALOGOWANYCH)
    if (loading) return <p className="p-8 text-gray-500">Ładowanie zamówień...</p>;


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-6 text-indigo-700">📦 Panel zamówień</h1>

            <div className="text-sm text-gray-500 mb-6">
                Kliknij wiersz zamówienia, aby rozwinąć wszystkie szczegóły.
            </div>

            <hr className="mb-8" />

            {/* ✅ SEKCJA ZAMÓWIEŃ DRUKU */}
            {renderOrderTable(printOrders, "Zlecenia Druku", Printer, 'PRINT')}

            <hr className="my-8 border-t border-indigo-200" />

            {/* ✅ SEKCJA ZAMÓWIEŃ SKANU */}
            {renderOrderTable(scanOrders, "Zlecenia Skanu", Scan, 'SCAN')}

        </div>
    );
}