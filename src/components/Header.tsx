"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiRotateCcw, FiRotateCw } from "react-icons/fi";

interface HeaderProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Header = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: HeaderProps) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gray-900 border-b border-gray-700"
    >
      <div className="px-2 py-2">
        <div className="flex justify-between items-center">
          <motion.div
            className="flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative w-13 h-13">
              <Image
                src="/ez-charts-logo.webp"
                alt="Easy Charts Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white">Ez Charts</h1>
              <span className="text-sm text-gray-300 font-medium">
                Enjoy, it's free!
              </span>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 mr-2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* GitHub Button */}
            <a
              href="https://github.com/LeddoEngano/easy-charts"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 group border border-gray-600"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium">Star on GitHub</span>
            </a>

            {/* X (Twitter) Button */}
            <a
              href="https://x.com/leddo_401"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 group border border-gray-600"
              title="Siga-nos no X"
            >
              <FaXTwitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </a>

            {/* Instagram Button */}
            <a
              href="https://instagram.com/leddo_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 group border border-gray-600"
              title="Siga-nos no Instagram"
            >
              <FaInstagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </a>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
