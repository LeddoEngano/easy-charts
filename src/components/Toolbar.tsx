"use client";

import { motion } from "framer-motion";

export type AxesMode = "off" | "quadrants" | "single";

interface ToolbarProps {
  axesMode: AxesMode;
  onAxesModeChange: (mode: AxesMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onOpenCodeDrawer?: () => void;
}

export const Toolbar = ({
  axesMode,
  onAxesModeChange,
  showGrid,
  onToggleGrid,
  onOpenCodeDrawer,
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
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              axesMode === "quadrants"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
            title="4 Quadrantes"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="4 Quadrantes"
            >
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </motion.button>

          {/* Single Quadrant Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onAxesModeChange(axesMode === "single" ? "off" : "single")
            }
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              axesMode === "single"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
            title="1 Quadrante"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="1 Quadrante"
            >
              <line x1="3" y1="21" x2="21" y2="21" />
              <line x1="3" y1="21" x2="3" y2="3" />
              <polyline points="17,7 21,3 17,3" />
              <polyline points="7,17 3,21 3,17" />
            </svg>
          </motion.button>

          {/* Grid Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleGrid}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              showGrid
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
            title={showGrid ? "Ocultar grid" : "Mostrar grid"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Grid"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </motion.button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Future tools can be added here */}
          <div className="text-sm text-gray-500">Ferramentas de gráfico</div>

          {/* Spacer to push Code button to the right */}
          <div className="flex-1" />

          {/* Code button */}
          {onOpenCodeDrawer && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCodeDrawer}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
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
