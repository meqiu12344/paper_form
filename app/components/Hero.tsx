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
      className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
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
          PROFESJONALNY DRUK / SKAN
          <br/> FORMAT A0+
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto mb-8"
        >
          Wydruki rysunków technicznych, plakatów, reklam na papierze, foliach, tekstyliach.
        </motion.p>

        <div className="flex center-center gap-10 m-auto max-w-md justify-center">
          <motion.a
            href="#formularz-drukowania"
            whileHover={{ scale: 1.05 }}
            className="flex items-center bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-700 transition"
          >
            Zamów druk
          </motion.a>

          <motion.a
            href="#formilarz-skanowania"
            whileHover={{ scale: 1.05 }}
            className="inline-block border-4 border-white text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Zamów skan
          </motion.a>
        </div>


      </div>
    </motion.section>
  );
}
