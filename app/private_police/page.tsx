// Komponenty pomocnicze dla czytelności
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
);

const List = ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2">{children}</ul>
);

export default function PrivacyPolicyPage() {
    return (
        <>
            <main className="bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-16 sm:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">Polityka prywatności</h1>
                        <Paragraph>
                            Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych oraz innych informacji
                            dotyczących Użytkowników serwisu prowadzonego przez Administratora.
                        </Paragraph>
                    </div>

                    <div>
                        <SectionTitle>1. Administrator danych</SectionTitle>
                        <Paragraph>
                            Administratorem danych osobowych jest: <strong>CAD Project Adam Wieczorkowski</strong> (dalej: "Administrator").
                        </Paragraph>
                        <Paragraph>
                            Adres: <strong>ul. Alfreda Jahna 5 54-703 Wrocław</strong>
                        </Paragraph>
                        <Paragraph>
                            Kontakt e-mail: <strong><a className="text-indigo-600" href="mailto:biuro@twojafirma.pl">biuro@drukarniaxyz.pl</a></strong>
                        </Paragraph>

                        <SectionTitle>2. Zakres stosowania polityki</SectionTitle>
                        <Paragraph>
                            Polityka ma zastosowanie do danych zbieranych w związku z korzystaniem z serwisu, w tym podczas składania zamówień,
                            korzystania z formularzy kontaktowych, przesyłania plików oraz korzystania z funkcji serwisu.
                        </Paragraph>

                        <SectionTitle>3. Jakie dane zbieramy</SectionTitle>
                        <Paragraph>W zależności od funkcji serwisu i działań Użytkownika przetwarzamy m.in.:</Paragraph>
                        <List>
                            <li>Dane identyfikacyjne i kontaktowe: imię i nazwisko, adres e-mail, numer telefonu, adres (jeżeli podany przy zamówieniu).</li>
                            <li>Dane zamówienia: wybrane usługi/produkty, ilość, cena, sposób odbioru (np. paczkomat InPost lub odbiór osobisty), opis zamówienia.</li>
                            <li>Dane płatnicze i rozliczeniowe przekazywane do procesora płatności (np. Stripe) — w aplikacji przekazywane są jedynie tokeny/identyfikatory transakcji; informacje o karcie płatniczej nie są przechowywane przez Administratora.</li>
                            <li>Pliki przesyłane przez użytkownika (np. pliki do druku) — przechowywane tymczasowo w celu realizacji zamówienia.</li>
                            <li>Dane techniczne i logi: adres IP, typ przeglądarki, informacje o urządzeniu, dane sesji, pliki cookies, dane telemetryczne.</li>
                            <li>Dane lokalizacyjne wybrane i przesłane dobrowolnie przez użytkownika (np. wybór paczkomatu InPost).</li>
                        </List>

                        <SectionTitle>4. Podstawa prawna przetwarzania</SectionTitle>
                        <List>
                            <li>Art. 6 ust. 1 lit. b RODO — przetwarzanie niezbędne do wykonania umowy (realizacja zamówienia, obsługa płatności, dostawa).</li>
                            <li>Art. 6 ust. 1 lit. a RODO — zgoda użytkownika (np. marketing, newsletter, niektóre cookies), o ile została wyrażona.</li>
                            <li>Art. 6 ust. 1 lit. c RODO — obowiązek prawny (np. obowiązki księgowe i podatkowe).</li>
                            <li>Art. 6 ust. 1 lit. f RODO — prawnie uzasadnione interesy Administratora (np. wykrywanie i zapobieganie nadużyciom, prowadzenie statystyk odwiedzalności), z zachowaniem praw i wolności użytkowników.</li>
                        </List>

                        <SectionTitle>5. Cele przetwarzania i okres przechowywania</SectionTitle>
                        <List>
                            <li>Realizacja umowy i obsługa zamówień — przechowywanie przez okres niezbędny do realizacji zamówienia oraz zgodnie z obowiązkami księgowymi (zazwyczaj 5 lat dla dokumentów księgowych).</li>
                            <li>Kontakt i obsługa zgłoszeń — przez okres niezbędny do obsługi zapytania.</li>
                            <li>Przetwarzanie danych dotyczących płatności — zgodnie z umową z procesorem płatności oraz obowiązkami prawnymi.</li>
                            <li>Pliki przesyłane przez użytkownika — przechowywane tymczasowo do wykonania usługi; po realizacji zlecenia pliki mogą być usuwane lub przechowywane dłużej wyłącznie za zgodą użytkownika.</li>
                            <li>Marketing i newsletter — do czasu wycofania zgody przez użytkownika.</li>
                            <li>Dane techniczne, logi i cookies — zwykle przez okresy niezbędne do analizy i diagnostyki, w zależności od typu ciasteczek (sesyjne, trwałe) oraz zasad podmiotów zewnętrznych (np. Google Analytics).</li>
                        </List>

                        <SectionTitle>6. Odbiorcy danych / podmioty przetwarzające</SectionTitle>
                        <Paragraph>Twoje dane mogą być udostępniane następującym kategoriom odbiorców:</Paragraph>
                        <List>
                            <li>Podmioty świadczące usługi płatnicze (np. Stripe) — w celu realizacji płatności;</li>
                            <li>Dostawcy usług hostingowych i infrastruktury (np. Vercel);</li>
                            <li>Dostawcy usług przechowywania plików i baz danych (np. Supabase);</li>
                            <li>Dostawcy usług logistycznych (np. InPost) — w zakresie danych niezbędnych do realizacji dostawy (np. wybór paczkomatu);</li>
                            <li>Dostawcy usług analitycznych i marketingowych (np. Google Analytics) — o ile Użytkownik wyraził zgodę.</li>
                        </List>

                        <SectionTitle>7. Przekazywanie danych poza EOG</SectionTitle>
                        <Paragraph>
                            Niektóre usługi (np. Stripe, Google) mogą przetwarzać dane w państwach spoza Europejskiego Obszaru Gospodarczego. W takich przypadkach Administrator stosuje odpowiednie mechanizmy zabezpieczające (np. standardowe klauzule umowne — SCC) lub korzysta z dostawców, którzy zapewniają odpowiednie gwarancje prawne.
                        </Paragraph>

                        <SectionTitle>8. Pliki cookies i technologie podobne</SectionTitle>
                        <Paragraph>
                            Serwis wykorzystuje pliki cookies w następujących celach:
                        </Paragraph>
                        <List>
                            <li>Niektóre cookies są niezbędne do prawidłowego działania serwisu (sesyjne, uwierzytelnianie).</li>
                            <li>Cookies funkcjonalne zapamiętują ustawienia i preferencje użytkownika.</li>
                            <li>Cookies analityczne (np. Google Analytics) służą do statystyk i poprawy serwisu — ich użycie może wymagać zgody użytkownika.</li>
                            <li>Cookies reklamowe i remarketingowe — stosowane przez zewnętrznych partnerów w celu wyświetlania reklam dopasowanych do zainteresowań.</li>
                        </List>
                        <Paragraph>
                            Użytkownik może zarządzać ustawieniami cookies poprzez ustawienia przeglądarki oraz mechanizmy udostępnione w serwisie (jeżeli są dostępne). Pamiętaj, że wyłączenie niektórych cookies może ograniczyć funkcjonalność serwisu.
                        </Paragraph>

                        <SectionTitle>9. Twoje prawa</SectionTitle>
                        <Paragraph>
                            Przysługują Ci prawa wynikające z przepisów o ochronie danych osobowych, w szczególności:
                        </Paragraph>
                        <List>
                            <li>prawo dostępu do danych oraz otrzymania kopii danych,</li>
                            <li>prawo do sprostowania danych,</li>
                            <li>prawo do usunięcia danych (prawo do bycia zapomnianym) — o ile nie zachodzą przesłanki prawne wymagające przechowywania danych,</li>
                            <li>prawo do ograniczenia przetwarzania,</li>
                            <li>prawo do przenoszenia danych,</li>
                            <li>prawo do wniesienia sprzeciwu wobec przetwarzania danych w celach marketingowych lub oparciu o prawnie uzasadnione interesy Administratora,</li>
                            <li>prawo do wycofania zgody w dowolnym czasie (jeżeli przetwarzanie opiera się na zgodzie) — wycofanie zgody nie wpływa na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.</li>
                        </List>
                        <Paragraph>
                            W celu wykonania praw prosimy o kontakt na adres e-mail: <strong><a className="text-indigo-600" href="mailto:biuro@twojafirma.pl">biuro@drukarniaxyz.pl</a></strong>.
                        </Paragraph>
                        <Paragraph>
                            Jeżeli uważasz, że przetwarzanie Twoich danych osobowych narusza przepisy, masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).
                        </Paragraph>

                        <SectionTitle>10. Zabezpieczenia</SectionTitle>
                        <Paragraph>
                            Administrator stosuje środki techniczne i organizacyjne adekwatne do ryzyka związanego z przetwarzaniem danych,
                            w tym szyfrowanie transmisji (SSL/TLS), ograniczenie dostępu do systemów, regularne aktualizacje oprogramowania oraz
                            umowy powierzenia przetwarzania z podmiotami trzecimi.
                        </Paragraph>

                        <SectionTitle>11. Informacje o przetwarzaniu danych przez podmioty zewnętrzne</SectionTitle>
                        <Paragraph>
                            W serwisie mogą działać usługi zewnętrzne, które przetwarzają dane w imieniu Administratora lub na własny rachunek — np.:
                        </Paragraph>
                        <List>
                            <li><strong>Stripe</strong> — obsługa płatności elektronicznych (dane transakcyjne przetwarzane przez Stripe zgodnie z regulaminem Stripe),</li>
                            <li><strong>Supabase</strong> — baza danych i przechowywanie plików (pliki do druku, dane zamówień),</li>
                            <li><strong>InPost / geowidget.inpost.pl</strong> — wybór paczkomatu i integracja z usługą dostawy,</li>
                            <li><strong>Vercel</strong> — hosting i infrastruktura serwisu,</li>
                            <li><strong>Usługi analityczne</strong> (np. Google Analytics) — jeżeli użytkownik wyraził zgodę,</li>
                        </List>

                        <SectionTitle>12. Przetwarzanie plików użytkownika</SectionTitle>
                        <Paragraph>
                            Pliki przesyłane przez użytkownika (np. pliki do druku) są przechowywane na serwerach dostawcy (np. Supabase). Administrator przechowuje
                            takie pliki jedynie przez okres niezbędny do realizacji usługi; po upływie tego okresu pliki są usuwane, chyba że Użytkownik wyrazi
                            zgodę na ich dłuższe przechowywanie.
                        </Paragraph>

                        <SectionTitle>13. Ograniczenia odpowiedzialności</SectionTitle>
                        <Paragraph>
                            Administrator dokłada wszelkich starań, aby dane były przetwarzane zgodnie z obowiązującymi przepisami i z zachowaniem wymogów
                            bezpieczeństwa. Niemniej jednak Administrator nie ponosi odpowiedzialności za zdarzenia wynikające z działania siły wyższej,
                            błędów lub zaniedbań podmiotów trzecich (np. usługodawców zewnętrznych), ani za skutki udostępnienia danych przez Użytkownika
                            osobom trzecim wbrew zaleceniom.
                        </Paragraph>

                        <SectionTitle>14. Postanowienia końcowe</SectionTitle>
                        <Paragraph>
                            Polityka prywatności może być aktualizowana. O wszelkich zmianach będziemy informować w sposób widoczny w serwisie lub poprzez
                            wysłanie informacji na adres e-mail, jeśli jest to wymagane prawnie lub praktycznie.
                        </Paragraph>
                        <Paragraph>
                            Aktualna wersja polityki prywatności obowiązuje od: <strong>23 listopada 2025 r.</strong>
                        </Paragraph>
                        <Paragraph>
                            Jeżeli chcesz otrzymać więcej informacji lub zgłosić sprawę dotyczącą przetwarzania danych, skontaktuj się: <strong><a className="text-indigo-600" href="mailto:biuro@twojafirma.pl">biuro@drukarniaxyz.pl</a></strong>.
                        </Paragraph>
                    </div>
                </div>
            </main>
        </>
    );
}