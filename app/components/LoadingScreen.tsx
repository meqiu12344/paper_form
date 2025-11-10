"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // 1.5 sekundy
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center z-50 text-white"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold mb-4"
          >
            Drukarnia XYZ
          </motion.h1>

          <motion.div
            className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"
            transition={{ repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}