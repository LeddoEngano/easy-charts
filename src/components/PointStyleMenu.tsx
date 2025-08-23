"use client";

import { motion } from "framer-motion";
import type { PointStyle } from "@/types/chart";

interface PointStyleMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  currentStyle: PointStyle;
  onStyleChange: (style: PointStyle) => void;
  onClose: () => void;
}

const styleOptions: Array<{
  value: PointStyle;
  label: string;
  preview: string;
}> = [
  { value: "default", label: "Padrão", preview: "●" },
  { value: "border", label: "Borda", preview: "◉" },
  { value: "hollow", label: "Vazio", preview: "○" },
  { value: "glow", label: "Glow", preview: "✨" },
  { value: "radar", label: "Radar", preview: "⊚" },
  { value: "hidden", label: "Oculto", preview: "👁️" },
];

export const PointStyleMenu = ({
  isOpen,
  x,
  y,
  currentStyle,
  onStyleChange,
  onClose,
}: PointStyleMenuProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <motion.div
        className="fixed z-50 bg-gray-800 rounded-lg p-2 shadow-xl border border-gray-700"
        style={{
          left: x + 10,
          top: y - 100,
        }}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-xs text-gray-300 font-medium mb-2 px-2">
          Estilo do Ponto
        </div>

        <div className="space-y-1">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStyleChange(option.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                currentStyle === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{option.preview}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
};
