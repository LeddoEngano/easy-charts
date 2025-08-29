"use client";

import { motion } from "framer-motion";
import { IoMdGrid } from "react-icons/io";
import { FiRotateCcw, FiRotateCw } from "react-icons/fi";

export type AxesMode = "off" | "quadrants" | "single";

interface ToolbarProps {
  axesMode: AxesMode;
  onAxesModeChange: (mode: AxesMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onOpenCodeDrawer?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Toolbar = ({
  axesMode,
  onAxesModeChange,
  showGrid,
  onToggleGrid,
  onOpenCodeDrawer,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ToolbarProps) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="px-4">
        <div className="flex items-center h-12 space-x-2">
          {/* 4 Quadrants Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onAxesModeChange(axesMode === "quadrants" ? "off" : "quadrants")
            }
            className={`w-9 h-9 p-1 cursor-pointer rounded-lg flex items-center justify-center transition-all duration-200 ${axesMode === "quadrants"
              ? "bg-ez border border-ez-200"
              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            title="4 Quadrantes"
          >
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="685.333" height="648" viewBox="0 0 514 486"><path d="M222.8 49.7C211.3 61.2 202 70.8 202 71.2s7.3.9 16.3 1l16.2.3v168L133 241l-101.5.5v19l101.5.5 101.5.5.5 101.5.5 101.5 7.5.3c4.1.2 8.5 0 9.7-.3l2.3-.5V261h170v33.5l21.7-21.8 21.8-21.7-21.8-21.7-21.7-21.8V241H255V72l9.3-.2c14.2-.2 21.8-.6 22.3-1 .6-.6-40.3-41.3-41.8-41.6-.7-.1-10.6 9.1-22 20.5" /><path d="M299.3 52.4c.3.8 3.3 5.5 6.6 10.4 3.4 5 6.1 9.4 6.1 9.7 0 .4-3.4 5.9-7.5 12.2-4.1 6.2-7.5 11.6-7.5 11.8 0 .3 2.2.5 4.9.5h4.9l4.7-7.5c2.5-4.1 5-7.7 5.6-8 .5-.4 3.2 3 6 7.4l5.2 8.1h4.8c2.7 0 4.9-.2 4.9-.5s-3.2-5.3-7-11.1c-3.9-5.7-7.3-11-7.6-11.7-.2-.7 2.3-5.5 5.7-10.7 8.2-12.7 8.1-12.2 2.3-11.8-4.6.3-4.9.5-8.1 5.8-5.7 9.3-5.1 8.8-7 6.3-1-1.2-3.1-4.4-4.8-7.2-2.9-5-3.1-5.1-7.9-5.1-3.7 0-4.7.3-4.3 1.4m100 99.9c.2.7 3.9 6.5 8.1 13L415 177v20.1l4.3-.3 4.2-.3.5-10c.3-5.5 1.1-11 1.8-12.3s4.2-6.8 7.8-12.2c3.5-5.5 6.4-10.2 6.4-10.5s-2-.5-4.5-.5c-4.9 0-5.1.3-11.9 12.2-1.4 2.6-3 5-3.6 5.3-.5.3-3.3-3.5-6.1-8.5l-5.3-9h-4.9c-3.6 0-4.8.3-4.4 1.3" /></svg>
          </motion.button>

          {/* Single Quadrant Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onAxesModeChange(axesMode === "single" ? "off" : "single")
            }
            className={`w-9 h-9 cursor-pointer rounded-lg flex items-center justify-center transition-all duration-200 ${axesMode === "single"
              ? "bg-ez border border-ez-200"
              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            title="1 Quadrante"
          >
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="685.333" height="648" viewBox="0 0 514 486"><path d="M144.8 130.7c-11.5 11.5-20.8 21.1-20.8 21.5s7.3.9 16.3 1l16.2.3.3 94.2.2 94.3h190v33.5l21.7-21.8 21.8-21.7-21.8-21.7-21.7-21.8V322H177V153l9.3-.2c14.2-.2 21.8-.6 22.3-1 .6-.6-40.3-41.3-41.8-41.6-.7-.1-10.6 9.1-22 20.5" /><path d="M221.3 133.4c.3.8 3.3 5.5 6.6 10.4 3.4 5 6.1 9.4 6.1 9.7 0 .4-3.4 5.9-7.5 12.2-4.1 6.2-7.5 11.6-7.5 11.8 0 .3 2.2.5 4.9.5h4.9l4.7-7.5c2.5-4.1 5-7.7 5.6-8 .5-.4 3.2 3 6 7.4l5.2 8.1h4.8c2.7 0 4.9-.2 4.9-.5s-3.2-5.3-7-11.1c-3.9-5.7-7.3-11-7.6-11.7-.2-.7 2.3-5.5 5.7-10.7 8.2-12.7 8.1-12.2 2.3-11.8-4.6.3-4.9.5-8.1 5.8-5.7 9.3-5.1 8.8-7 6.3-1-1.2-3.1-4.4-4.8-7.2-2.9-5-3.1-5.1-7.9-5.1-3.7 0-4.7.3-4.3 1.4m100 99.9c.2.7 3.9 6.5 8.1 13L337 258v20.1l4.3-.3 4.2-.3.5-10c.3-5.5 1.1-11 1.8-12.3s4.2-6.8 7.8-12.2c3.5-5.5 6.4-10.2 6.4-10.5s-2-.5-4.5-.5c-4.9 0-5.1.3-11.9 12.2-1.4 2.6-3 5-3.6 5.3-.5.3-3.3-3.5-6.1-8.5l-5.3-9h-4.9c-3.6 0-4.8.3-4.4 1.3" /></svg>
          </motion.button>

          {/* Grid Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleGrid}
            className={`w-9 h-9 cursor-pointer rounded-lg flex items-center justify-center transition-all duration-200 ${showGrid
              ? "bg-ez border border-ez-200"
              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            title={showGrid ? "Ocultar grid" : "Mostrar grid"}
          >
            <IoMdGrid size={30} />
          </motion.button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Future tools can be added here */}
          <div className="text-sm text-gray-500">Ferramentas de gráfico</div>

          {/* Spacer to push content to the right */}
          <div className="flex-1" />

          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1">
            {/* Undo Button */}
            {onUndo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUndo}
                disabled={!canUndo}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border ${canUndo
                  ? "bg-white hover:bg-gray-50 cursor-pointer text-gray-700 border-gray-300 hover:border-gray-400"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
                title="Desfazer (Ctrl+Z)"
              >
                <FiRotateCcw className="w-4 h-4" />
              </motion.button>
            )}

            {/* Redo Button */}
            {onRedo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRedo}
                disabled={!canRedo}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border ${canRedo
                  ? "bg-white hover:bg-gray-50 text-gray-700 cursor-pointer border-gray-300 hover:border-gray-400"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
                title="Refazer (Ctrl+Shift+Z)"
              >
                <FiRotateCw className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Code button */}
          {onOpenCodeDrawer && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCodeDrawer}
              className="bg-gray-800 cursor-pointer text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
              title="Exportar código"
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
                role="img"
                aria-label="Código"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Code
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
