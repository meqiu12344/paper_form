"use client";

import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className='w-full text-center flex justify-center flex-col items-center'>
            <h3 className="text-xl font-semibold text-white">
                <img src="./full-logo-drukarnia.png" alt="Drukarnia XYZ Logo" className="w-[70%] h-auto inline-block mr-2" />
            </h3>
            {/* <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="facebook" className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.09 5.66 21.22 10.44 22v-7.02H7.9v-2.9h2.54V9.33c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22C18.34 21.22 22 17.09 22 12.07z"/></svg>
              </a>
              <a href="#" aria-label="twitter" className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.92c-.63.28-1.3.47-2 .55.72-.43 1.27-1.12 1.53-1.94-.67.4-1.41.7-2.2.86C18.76 4.6 17.82 4 16.73 4c-1.5 0-2.72 1.2-2.72 2.69 0 .21.02.42.07.62C11.1 7.27 8 5.66 6 3.12c-.23.4-.36.87-.36 1.37 0 .94.48 1.77 1.2 2.25-.56-.02-1.08-.17-1.54-.42v.04c0 1.32.94 2.42 2.19 2.68-.46.12-.95.15-1.45.05.41 1.28 1.6 2.21 3.01 2.24C8.08 14.9 6.28 15.6 4.37 15.6c-.28 0-.55-.02-.82-.05C3.83 17 5.06 18 6.6 18.22c-1.07.84-2.42 1.34-3.89 1.34-.25 0-.5-.01-.74-.04 1.38.87 3.02 1.37 4.79 1.37 5.74 0 8.88-4.83 8.88-9.02v-.41c.62-.45 1.15-1.02 1.57-1.66z"/></svg>
              </a>
              <a href="#" aria-label="instagram" className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm8.5 3.5a1 1 0 110 2 1 1 0 010-2zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z"/></svg>
              </a>
            </div> */}
          </div>

          <div className='w-full text-center'>
            <h4 className="text-lg font-semibold text-white">Skróty</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white">Strona główna</a></li>
              <li><a href="/checkout" className="hover:text-white">Zmów druk</a></li>
              <li><a href="/orders" className="hover:text-white">Zamów Skan</a></li>
              <li><a href="/private_police" className="hover:text-white">Polityka prywatności</a></li>
            </ul>
          </div>

          <div className="w-full text-center">
            <h4 className="text-lg font-semibold text-white">Kontakt</h4>
            <p className="mt-4 text-sm text-gray-300">ul. Alfreda Jahna 5,<br/>54-703 Wrocław</p>
            <p className="mt-3 text-sm text-gray-300">Telefon: <a href="tel:+48123123123" className="hover:text-white">+48 123 123 123</a></p>
            <p className="mt-1 text-sm text-gray-300">E-mail: <a href="mailto:biuro@twojafirma.pl" className="hover:text-white">biuro@drukarniaxyz.pl</a></p>
          </div>
        </div>

        <div className="border-t border-white/6 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© {year} CAD Project Adam Wieczorkowski. Wszelkie prawa zastrzeżone.</p>
          
          <div className="text-sm text-gray-400">
            Projekt i obsługa: <a href="https://mateuszmaniak.netlify.app" className="hover:text-white border-r-2 pr-3">Mateusz Maniak</a>
            <a href="/orders" className="hover:text-white pl-3">Zaloguj</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
