"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Text } from "@/types/chart";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { CgAdd } from "react-icons/cg";
import { RxText } from "react-icons/rx";
import { MdDeleteOutline } from "react-icons/md";
interface SidebarProps {
  onToggleAddingPoints: () => void;
  onToggleAddingCurves: () => void;
  onToggleAddingText: () => void;
  onToggleDeletingLines: () => void;
  onClearChart: () => void;
  onLineColorChange: (lineId: string, color: string) => void;
  onStartNewLine: () => void;
  onLineHover: (lineId: string | null) => void;
  isAddingPoints: boolean;
  isAddingCurves: boolean;
  isAddingText: boolean;
  isDeletingLines: boolean;
  lines: Array<{ id: string; color: string }>;
  texts: Text[];
  onTextClick?: (text: Text) => void;
  onTextDelete?: (textId: string) => void;
}

export const Sidebar = ({
  onToggleAddingPoints,
  onToggleAddingCurves,
  onToggleAddingText,
  onToggleDeletingLines,
  onClearChart,
  onLineColorChange,
  onStartNewLine,
  onLineHover,
  isAddingPoints,
  isAddingCurves,
  isAddingText,
  isDeletingLines,
  lines,
  texts,
  onTextClick,
  onTextDelete,
}: SidebarProps) => {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Quick select colors
  const quickColors = [
    "#000000", // Black
    "#ef4444", // Red
    "#bfff70", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#3b82f6", // Cyan
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
        className={`w-10 h-10 cursor-pointer rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${isAddingPoints
          ? "bg-ez-500 text-ez-900 shadow-lg"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        title="Adicionar Pontos"
      >
        <CgAdd size={20} />
      </motion.button>

      {/* Add Curves Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleAddingCurves}
        disabled={lines.length === 0}
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${isAddingCurves
          ? "bg-purple-500 text-white shadow-lg"
          : lines.length === 0
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-white"
          }`}
        title="Adicionar Curvas"
      >
        <TbEaseInOutControlPoints />
      </motion.button>

      {/* Add Text Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleAddingText}
        className={`w-10 h-10 rounded-lg cursor-pointer mb-3 flex items-center justify-center transition-all duration-200 ${isAddingText
          ? "bg-blue-500 text-white shadow-lg"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        title="Adicionar Texto"
      >
        <RxText />
      </motion.button>

      {/* Delete Lines Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleDeletingLines}
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${isDeletingLines
          ? "bg-red-500 text-white shadow-lg"
          : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-red-600 hover:text-white"
          }`}
        title="Excluir Elementos"
      >
        <MdDeleteOutline />
      </motion.button>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-700 mb-3" />

      {/* Line Layers - Only show when points or curves tools are active */}
      {lines.length > 0 && (isAddingPoints || isAddingCurves) && (
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
                className="w-10 h-10 cursor-pointer rounded-lg flex items-center justify-center text-xs font-medium relative"
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
                            className={`w-6 h-6 cursor-pointer rounded border-2 hover:scale-110 transition-transform ${line.color === color
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

      {/* Text Layers - Only show when text tool is active */}
      {texts && texts.length > 0 && isAddingText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-2"
        >
          {texts.map((text, index) => (
            <motion.div
              key={text.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Text Item Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTextClick?.(text)}
                className="w-10 h-10 cursor-pointer rounded-lg flex items-center justify-center text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600"
                title={`Texto: "${text.content}" - Clique para editar`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="17" y1="10" x2="3" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
              </motion.button>

              {/* Text preview tooltip */}
              <div className="absolute left-12 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-50">
                {text.content.length > 10
                  ? `${text.content.slice(0, 10)}...`
                  : text.content}
              </div>
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
