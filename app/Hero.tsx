"use client"; // bardzo ważne, żeby to był klient

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 80]); // efekt parallax

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative h-[100vh] flex items-center justify-center text-center text-white overflow-hidden"
    >
      {/* --- Tło parallax --- */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/hero.jpg" // upewnij się, że plik jest w public/
          alt="Drukarnia wielkoformatowa"
          fill
          className="object-cover brightness-50"
          priority
        />
      </motion.div>

      {/* --- Treść na tle --- */}
      <div className="relative z-10 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg"
        >
          Profesjonalny Druk Wielkoformatowy
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto mb-8"
        >
          Banery, plakaty, folie i wydruki reklamowe – zamów online z dostawą w
          24h w całej Polsce.
        </motion.p>

        <motion.a
          href="#dlaczego-my"
          whileHover={{ scale: 1.05 }}
          className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full hover:bg-indigo-100 transition"
        >
          Dowiedz się więcej
        </motion.a>
      </div>
    </motion.section>
  );
}
