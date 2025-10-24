"use client";

import { motion } from "framer-motion";
import { Award, Clock, ShieldCheck } from "lucide-react";

export default function DlaczegoMy() {
  return (
    <motion.section
      id="dlaczego-my"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="py-24 text-center px-6 max-w-6xl mx-auto"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
        Dlaczego warto wybrać{" "}
        <span className="text-indigo-600">Drukarnię XYZ</span>?
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        {/* --- Najwyższa jakość druku --- */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 0.5 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition bg-gradient-to-br from-indigo-50 to-white"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Najwyższa Jakość Druku
          </h3>
          <p className="text-gray-600">
            Fotograficzna jakość, nasycone kolory i precyzyjne detale – Twoje
            projekty przyciągną uwagę każdego.
          </p>
        </motion.div>

        {/* --- Ekspresowa realizacja --- */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: -0.5 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition bg-gradient-to-br from-indigo-50 to-white"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 7 }}
          >
            <Clock className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Ekspresowa Realizacja
          </h3>
          <p className="text-gray-600">
            Zlecenia realizujemy nawet w 24 godziny, a gotowe produkty dostarczamy
            kurierem pod Twoje drzwi.
          </p>
        </motion.div>

        {/* --- Gwarancja satysfakcji --- */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition bg-gradient-to-br from-indigo-50 to-white"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 5 }}
          >
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Gwarancja Satysfakcji
          </h3>
          <p className="text-gray-600">
            Jeśli wydruk nie spełnia oczekiwań, wykonamy poprawkę bez dodatkowych
            kosztów – stawiamy na pełne zadowolenie klienta.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
