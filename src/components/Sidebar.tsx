"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SidebarProps {
  onToggleAddingPoints: () => void;
  onToggleAddingCurves: () => void;
  onToggleDeletingLines: () => void;
  onClearChart: () => void;
  onLineColorChange: (lineId: string, color: string) => void;
  onStartNewLine: () => void;
  onLineHover: (lineId: string | null) => void;
  isAddingPoints: boolean;
  isAddingCurves: boolean;
  isDeletingLines: boolean;
  lines: Array<{ id: string; color: string }>;
}

export const Sidebar = ({
  onToggleAddingPoints,
  onToggleAddingCurves,
  onToggleDeletingLines,
  onClearChart,
  onLineColorChange,
  onStartNewLine,
  onLineHover,
  isAddingPoints,
  isAddingCurves,
  isDeletingLines,
  lines,
}: SidebarProps) => {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Quick select colors
  const quickColors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f97316", // Orange
  ];

  // Close color picker when clicking on backdrop
  const handleBackdropClick = () => {
    setShowColorPicker(null);
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-16 bg-gray-900 border-r border-gray-700 shadow-lg flex flex-col items-center py-4"
    >
      {/* Add Points Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleAddingPoints}
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${
          isAddingPoints
            ? "bg-blue-500 text-white shadow-lg"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        title="Adicionar Pontos"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Adicionar pontos"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </motion.button>

      {/* Add Curves Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleAddingCurves}
        disabled={lines.length === 0}
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${
          isAddingCurves
            ? "bg-purple-500 text-white shadow-lg"
            : lines.length === 0
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        title="Adicionar Curvas"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Adicionar curvas"
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </motion.button>

      {/* Delete Lines Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleDeletingLines}
        disabled={lines.length === 0}
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${
          isDeletingLines
            ? "bg-red-500 text-white shadow-lg"
            : lines.length === 0
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white"
        }`}
        title="Excluir Linhas"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Limpar gráfico"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </motion.button>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-700 mb-3" />

      {/* Line Layers */}
      {lines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-2"
        >
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Line Layer Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setShowColorPicker(
                    showColorPicker === line.id ? null : line.id,
                  )
                }
                onMouseEnter={() => onLineHover(line.id)}
                onMouseLeave={() => onLineHover(null)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium relative"
                style={{ backgroundColor: line.color }}
                title={`Linha ${index + 1} - Clique para alterar cor`}
              >
                {index + 1}
              </motion.button>

              {/* Color Picker for this line */}
              {showColorPicker === line.id && (
                <>
                  {/* Backdrop to catch clicks outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={handleBackdropClick}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        handleBackdropClick();
                      }
                    }}
                    role="button"
                    tabIndex={-1}
                  />
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-20 top-0 bg-gray-800 rounded-lg p-3 shadow-xl z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="text-xs text-gray-300 font-medium">
                        Cor da Linha
                      </div>

                      {/* Quick select colors - 2 rows of 4 */}
                      <div className="grid grid-cols-4 gap-2">
                        {quickColors.map((color) => (
                          <button
                            type="button"
                            key={color}
                            onClick={() => onLineColorChange(line.id, color)}
                            className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                              line.color === color
                                ? "border-white"
                                : "border-gray-600"
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Cor ${color}`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={line.color}
                          onChange={(e) =>
                            onLineColorChange(line.id, e.target.value)
                          }
                          className="w-8 h-8 rounded border-2 border-gray-600 cursor-pointer bg-transparent"
                          title="Escolher cor"
                        />
                        <input
                          type="text"
                          value={line.color}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                              onLineColorChange(line.id, value);
                            }
                          }}
                          className="w-20 h-8 px-2 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          placeholder="#000000"
                          maxLength={7}
                          title="Digite o código hexadecimal"
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Color Picker Backdrop */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleBackdropClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleBackdropClick();
            }
          }}
          role="button"
          tabIndex={-1}
        />
      )}
    </motion.div>
  );
};
