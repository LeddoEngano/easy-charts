"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CgAdd } from "react-icons/cg";
import { MdDeleteOutline } from "react-icons/md";
import { RxText } from "react-icons/rx";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { LineStyleMenu } from "@/components/LineStyleMenu";
import type { LineStyle, Text } from "@/types/chart";

interface SidebarProps {
  onToggleAddingPoints: () => void;
  onToggleAddingCurves: () => void;
  onToggleAddingText: () => void;
  onToggleDeletingLines: () => void;
  onClearChart: () => void;
  onLineColorChange: (lineId: string, color: string) => void;
  onLineStyleChange: (lineId: string, style: LineStyle) => void;
  onStartNewLine: () => void;
  onLineHover: (lineId: string | null) => void;
  onLinePreviewStyle: (lineId: string | null, style: LineStyle) => void;
  onLinePreviewColor: (lineId: string | null, color: string) => void;
  isAddingPoints: boolean;
  isAddingCurves: boolean;
  isAddingText: boolean;
  isDeletingLines: boolean;
  lines: Array<{ id: string; color: string; style: LineStyle }>;
  texts: Text[];
  onTextClick?: (text: Text) => void;
  onTextDelete?: (textId: string) => void;
}

export const Sidebar = ({
  onToggleAddingPoints,
  onToggleAddingCurves,
  onToggleAddingText,
  onToggleDeletingLines,
  onLineColorChange,
  onLineStyleChange,
  onLineHover,
  onLinePreviewStyle,
  onLinePreviewColor,
  isAddingPoints,
  isAddingCurves,
  isAddingText,
  isDeletingLines,
  lines,
  texts,
  onTextClick,
}: SidebarProps) => {
  const [showLineStyleMenu, setShowLineStyleMenu] = useState<string | null>(
    null,
  );

  // Close line style menu when clicking on backdrop
  const handleBackdropClick = () => {
    setShowLineStyleMenu(null);
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
        className={`w-10 h-10 cursor-pointer rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${
          isAddingPoints
            ? "bg-ez-500 text-ez-900 shadow-lg"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        title="Add Points"
      >
        <CgAdd size={20} />
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
              : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700 hover:text-white"
        }`}
        title="Add Curves"
      >
        <TbEaseInOutControlPoints />
      </motion.button>

      {/* Add Text Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleAddingText}
        className={`w-10 h-10 rounded-lg cursor-pointer mb-3 flex items-center justify-center transition-all duration-200 ${
          isAddingText
            ? "bg-blue-500 text-white shadow-lg"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        title="Add Text"
      >
        <RxText />
      </motion.button>

      {/* Delete Lines Tool */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleDeletingLines}
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center transition-all duration-200 ${
          isDeletingLines
            ? "bg-red-500 text-white shadow-lg"
            : "bg-gray-800 text-gray-300 cursor-pointer hover:bg-red-600 hover:text-white"
        }`}
        title="Delete Elements"
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
                  setShowLineStyleMenu(
                    showLineStyleMenu === line.id ? null : line.id,
                  )
                }
                onMouseEnter={() => onLineHover(line.id)}
                onMouseLeave={() => onLineHover(null)}
                className="w-10 h-10 cursor-pointer rounded-lg flex items-center justify-center text-xs font-medium relative"
                style={{ backgroundColor: line.color }}
                title={`Line ${index + 1} - Click to configure`}
              >
                {index + 1}
              </motion.button>

              {/* Line Style Menu for this line */}
              {showLineStyleMenu === line.id && (
                <LineStyleMenu
                  isOpen={true}
                  x={80}
                  y={100 + index * 60}
                  currentColor={line.color}
                  currentStyle={line.style}
                  lineId={line.id}
                  onColorChange={(color) => onLineColorChange(line.id, color)}
                  onStyleChange={(style) => onLineStyleChange(line.id, style)}
                  onPreviewStyle={(style) => onLinePreviewStyle(line.id, style)}
                  onPreviewColor={(color) => onLinePreviewColor(line.id, color)}
                  onClose={() => setShowLineStyleMenu(null)}
                />
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
                title={`Text: "${text.content}" - Click to edit`}
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
                  aria-label="Text"
                >
                                      <title>Text</title>
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

      {/* Line Style Menu Backdrop */}
      {showLineStyleMenu && (
        <button
          type="button"
          className="fixed inset-0 z-40"
          onClick={handleBackdropClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleBackdropClick();
            }
          }}
          aria-label="Close style menu"
        />
      )}
    </motion.div>
  );
};
