"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-indigo-600 text-white shadow">
              {/* Simple SVG mark */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
            </span>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-gray-900">Drukarnia XYZ</div>
              <div className="text-xs text-gray-500">Druk · Skan · Usługi</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-indigo-600">Strona główna</Link>
            <Link href="#formularz-drukowania" className="text-gray-700 hover:text-indigo-600">Druk</Link>
            <Link href="#formularz-skanowania" className="text-gray-700 hover:text-indigo-600">Skan</Link>
            <Link href="tel:730496403" className="bg-blue-700 p-3 rounded-2xl text-white">Zadźwoń</Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Link href="/" className="text-gray-700 hover:text-indigo-600">Strona główna</Link>
            <Link href="#formularz-drukowania" className="text-gray-700 hover:text-indigo-600">Druk</Link>
            <Link href="#formularz-skanowania" className="text-gray-700 hover:text-indigo-600">Skan</Link>
            <Link href="tel:730496403" className="bg-blue-700 p-3 rounded-2xl text-white">Zadźwoń</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
