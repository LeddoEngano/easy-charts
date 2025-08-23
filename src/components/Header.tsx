"use client";

import { motion } from "framer-motion";

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-lg border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Easy Charts</h1>
            <span className="ml-2 text-sm text-gray-500">
              • Dados salvos automaticamente
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>Salvando...</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
