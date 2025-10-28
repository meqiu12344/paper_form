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
                            Polityka prywatności opisuje zasady przetwarzania przez nas informacji na Twój temat, w tym danych osobowych oraz ciasteczek, czyli tzw. cookies.
                        </Paragraph>
                    </div>

                    <div>
                        <SectionTitle>1. Informacje ogólne</SectionTitle>
                        <Paragraph>
                            1. Niniejsza polityka dotyczy Serwisu www, funkcjonującego pod adresem url: <strong>rodzinabezdlugu.pl</strong>
                        </Paragraph>
                        <Paragraph>
                            2. Operatorem serwisu oraz Administratorem danych osobowych jest: <strong>Tologiczne </strong>
                        </Paragraph>
                        <Paragraph>
                            3. Adres kontaktowy poczty elektronicznej operatora: <strong>biuro@tologiczne.pl</strong>
                        </Paragraph>
                        <Paragraph>
                            4. Operator jest Administratorem Twoich danych osobowych w odniesieniu do danych podanych dobrowolnie w Serwisie.
                        </Paragraph>

                        <Paragraph>
                            5. Serwis wykorzystuje dane osobowe w następujących celach:
                        </Paragraph>
                        <List>
                            <li>Prowadzenie newslettera</li>
                            <li>Obsługa zapytań przez formularz</li>
                        </List>

                        <Paragraph>
                            6. Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniu w następujący sposób:
                        </Paragraph>
                        <List>
                            <li>Poprzez dobrowolnie wprowadzone w formularzach dane, które zostają wprowadzone do systemów Operatora.</li>
                            <li>Poprzez zapisywanie w urządzeniach końcowych plików cookie (tzw. „ciasteczka”).</li>
                        </List>

                        <SectionTitle>2. Wybrane metody ochrony danych stosowane przez Operatora</SectionTitle>
                        <Paragraph>
                            Miejsca logowania i wprowadzania danych osobowych są chronione w warstwie transmisji (certyfikat SSL). Dzięki temu dane osobowe i dane logowania, wprowadzone na stronie, zostają zaszyfrowane w komputerze użytkownika i mogą być odczytane jedynie na docelowym serwerze.
                        </Paragraph>
                        <Paragraph>
                            Istotnym elementem ochrony danych jest regularna aktualizacja wszelkiego oprogramowania, wykorzystywanego przez Operatora do przetwarzania danych osobowych, co w szczególności oznacza regularne aktualizacje komponentów programistycznych.
                        </Paragraph>

                        <SectionTitle>3. Hosting</SectionTitle>
                        <Paragraph>
                            Serwis jest hostowany (technicznie utrzymywany) na serwerach operatora: Vercel
                        </Paragraph>
                        <Paragraph>
                            Firma hostingowa w celu zapewnienia niezawodności technicznej prowadzi logi na poziomie serwera. Zapisowi mogą podlegać:
                        </Paragraph>
                        <List>
                            <li>zasoby określone identyfikatorem URL (adresy żądanych zasobów – stron, plików),</li>
                            <li>czas nadejścia zapytania,</li>
                            <li>czas wysłania odpowiedzi,</li>
                            <li>nazwę stacji klienta – identyfikacja realizowana przez protokół HTTP,</li>
                            <li>informacje o błędach jakie nastąpiły przy realizacji transakcji HTTP,</li>
                            <li>adres URL strony poprzednio odwiedzanej przez użytkownika (referer link) – w przypadku gdy przejście do Serwisu nastąpiło przez odnośnik,</li>
                            <li>informacje o przeglądarce użytkownika,</li>
                            <li>informacje o adresie IP.</li>
                        </List>

                        <SectionTitle>4. Twoje prawa i dodatkowe informacje o sposobie wykorzystania danych</SectionTitle>
                        <Paragraph>
                            W niektórych sytuacjach Administrator ma prawo przekazywać Twoje dane osobowe innym odbiorcom, jeśli będzie to niezbędne do wykonania zawartej z Tobą umowy lub do zrealizowania obowiązków ciążących na Administratorze. Dotyczy to takich grup odbiorców: firma hostingowa na zasadzie powierzenia, firmy, świadczące usługi marketingu na rzecz Administratora.
                        </Paragraph>
                        <Paragraph>
                            Przysługuje Ci prawo żądania od Administratora: dostępu do danych osobowych Ciebie dotyczących, ich sprostowania, usunięcia, ograniczenia przetwarzania, oraz przenoszenia danych.
                        </Paragraph>
                        <Paragraph>
                            Na działania Administratora przysługuje skarga do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.
                        </Paragraph>
                        <Paragraph>
                            Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi Serwisu.
                        </Paragraph>

                        <SectionTitle>5. Informacje w formularzach</SectionTitle>
                        <Paragraph>
                            Serwis zbiera informacje podane dobrowolnie przez użytkownika, w tym dane osobowe, o ile zostaną one podane. Serwis może zapisać informacje o parametrach połączenia (oznaczenie czasu, adres IP). Dane podane w formularzu są przetwarzane w celu wynikającym z funkcji konkretnego formularza, np. w celu dokonania procesu obsługi zgłoszenia lub kontaktu handlowego.
                        </Paragraph>

                        <SectionTitle>6. Logi Administratora</SectionTitle>
                        <Paragraph>
                            Informacje o zachowaniu użytkowników w serwisie mogą podlegać logowaniu. Dane te są wykorzystywane w celu administrowania serwisem.
                        </Paragraph>

                        <SectionTitle>7. Istotne techniki marketingowe</SectionTitle>
                        <Paragraph>
                            Operator stosuje analizę statystyczną ruchu na stronie, poprzez Google Analytics (Google Inc. z siedzibą w USA). Operator nie przekazuje do operatora tej usługi danych osobowych, a jedynie zanonimizowane informacje. Usługa bazuje na wykorzystaniu ciasteczek w urządzeniu końcowym użytkownika.
                        </Paragraph>

                        <SectionTitle>8. Informacja o plikach cookies</SectionTitle>
                        <Paragraph>Serwis korzysta z plików cookies. Pliki cookies (tzw. „ciasteczka”) stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w urządzeniu końcowym Użytkownika Serwisu i przeznaczone są do korzystania ze stron internetowych Serwisu. Podmiotem zamieszczającym na urządzeniu końcowym Użytkownika Serwisu pliki cookies oraz uzyskującym do nich dostęp jest operator Serwisu.</Paragraph>

                        <SubTitle>Cel wykorzystywania plików cookies:</SubTitle>
                        {/* --- POPRAWKA TUTAJ --- */}
                        <List>
                            <li>utrzymanie sesji użytkownika Serwisu (po zalogowaniu), dzięki której użytkownik nie musi na każdej podstronie Serwisu ponownie wpisywać loginu i hasła;</li>
                            <li>realizacji celów określonych powyżej w części „Istotne techniki marketingowe”.</li>
                        </List>

                        <Paragraph>Oprogramowanie do przeglądania stron internetowych (przeglądarka internetowa) zazwyczaj domyślnie dopuszcza przechowywanie plików cookies w urządzeniu końcowym Użytkownika. Użytkownicy Serwisu mogą dokonać zmiany ustawień w tym zakresie. Przeglądarka internetowa umożliwia usunięcie plików cookies. Możliwe jest także automatyczne blokowanie plików cookies.</Paragraph>

                        <SectionTitle>9. Zarządzanie plikami cookies</SectionTitle>
                        <Paragraph>Jeśli użytkownik nie chce otrzymywać plików cookies, może zmienić ustawienia przeglądarki. Zastrzegamy, że wyłączenie obsługi plików cookies niezbędnych dla procesów uwierzytelniania, bezpieczeństwa, utrzymania preferencji użytkownika może utrudnić, a w skrajnych przypadkach może uniemożliwić korzystanie ze stron www.</Paragraph>
                    </div>
                </div>
            </main>
            
        </>
    );
}