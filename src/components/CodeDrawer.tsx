"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ChartData } from "@/types/chart";
import { CodeBlock } from "@/components/ui/code-block";
import type { AxesMode } from "./Toolbar";

interface CodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ChartData;
  showGrid: boolean;
  axesMode: AxesMode;
}

export const CodeDrawer = ({
  isOpen,
  onClose,
  chartData,
  showGrid,
  axesMode,
}: CodeDrawerProps) => {
  const generateAxesCode = (mode: AxesMode) => {
    if (mode === "quadrants") {
      return `
      {/* Axes - 4 Quadrants Mode */}
      <g>
        {/* X Axis */}
        <motion.line
          x1={40}
          y1={300}
          x2={760}
          y2={300}
          stroke="#374151"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Y Axis */}
        <motion.line
          x1={400}
          y1={40}
          x2={400}
          y2={560}
          stroke="#374151"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
        />

        {/* X Axis Arrows */}
        <motion.polygon
          points="750,295 760,300 750,305"
          fill="#374151"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
        <motion.polygon
          points="50,295 40,300 50,305"
          fill="#374151"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />

        {/* Y Axis Arrows */}
        <motion.polygon
          points="395,50 400,40 405,50"
          fill="#374151"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        />
        <motion.polygon
          points="395,550 400,560 405,550"
          fill="#374151"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        />
      </g>`;
    } else if (mode === "single") {
      return `
      {/* Axes - Single Quadrant Mode */}
      <g>
        {/* X Axis */}
        <motion.line
          x1={40}
          y1={560}
          x2={760}
          y2={560}
          stroke="#374151"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Y Axis */}
        <motion.line
          x1={40}
          y1={560}
          x2={40}
          y2={40}
          stroke="#374151"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
        />

        {/* X Axis Arrow */}
        <motion.polygon
          points="750,555 760,560 750,565"
          fill="#374151"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />

        {/* Y Axis Arrow */}
        <motion.polygon
          points="35,50 40,40 45,50"
          fill="#374151"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        />

        {/* X Axis Label */}
        <motion.text
          x={740}
          y={585}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          X
        </motion.text>

        {/* Y Axis Label */}
        <motion.text
          x={15}
          y={60}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          Y
        </motion.text>
      </g>`;
    }
    return "";
  };

  const generateTypeScriptCode = () => {
    const pointsCode = chartData.points
      .map(
        (point) =>
          `  { id: "${point.id}", x: ${point.x}, y: ${point.y}${point.label ? `, label: "${point.label}"` : ""}, color: "${point.color}" }`,
      )
      .join(",\n");

    const linesCode = chartData.lines
      .map(
        (line) => `  { 
      id: "${line.id}", 
      startPointId: "${line.startPointId}", 
      endPointId: "${line.endPointId}",
      controlPointIds: [${line.controlPointIds.map((id) => `"${id}"`).join(", ")}],
      color: "${line.color}"
    }`,
      )
      .join(",\n");

    return `"use client";

import { motion } from "framer-motion";

// Types
interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
  color: string;
}

interface Line {
  id: string;
  startPointId: string;
  endPointId: string;
  controlPointIds: string[];
  color: string;
}

interface ChartData {
  points: Point[];
  lines: Line[];
}

// Chart data
const chartData: ChartData = {
  points: [
${pointsCode}
  ],
  lines: [
${linesCode}
  ]
};

// Helper function to generate curve paths
const generateCurvePath = (
  startPoint: Point,
  endPoint: Point,
  controlPoints: Point[],
  padding: number
): string => {
  if (controlPoints.length === 1) {
    const cp = controlPoints[0];
    return \`M \${startPoint.x + padding} \${startPoint.y + padding} Q \${cp.x + padding} \${cp.y + padding} \${endPoint.x + padding} \${endPoint.y + padding}\`;
  } else if (controlPoints.length === 2) {
    const cp1 = controlPoints[0];
    const cp2 = controlPoints[1];
    return \`M \${startPoint.x + padding} \${startPoint.y + padding} C \${cp1.x + padding} \${cp1.y + padding} \${cp2.x + padding} \${cp2.y + padding} \${endPoint.x + padding} \${endPoint.y + padding}\`;
  } else {
    let path = \`M \${startPoint.x + padding} \${startPoint.y + padding}\`;
    
    for (let i = 0; i < controlPoints.length; i++) {
      const cp = controlPoints[i];
      if (i === 0) {
        const midX = (startPoint.x + cp.x) / 2;
        const midY = (startPoint.y + cp.y) / 2;
        path += \` Q \${cp.x + padding} \${cp.y + padding} \${midX + padding} \${midY + padding}\`;
      } else if (i === controlPoints.length - 1) {
        path += \` Q \${cp.x + padding} \${cp.y + padding} \${endPoint.x + padding} \${endPoint.y + padding}\`;
      } else {
        const nextCp = controlPoints[i + 1];
        const midX = (cp.x + nextCp.x) / 2;
        const midY = (cp.y + nextCp.y) / 2;
        path += \` Q \${cp.x + padding} \${cp.y + padding} \${midX + padding} \${midY + padding}\`;
      }
    }
    
    return path;
  }
};

// Chart component
const Chart = () => {
  const padding = 40;
  
  return (
    <svg 
      width="800" 
      height="600" 
      className="bg-white"
      role="img"
      aria-label="Chart with points and lines"
    >
      ${showGrid
        ? `{/* Grid background */}
      <defs>
        <pattern 
          id="grid" 
          width="20" 
          height="20" 
          patternUnits="userSpaceOnUse"
        >
          <path 
            d="M 20 0 L 0 0 0 20" 
            fill="none" 
            stroke="#f0f0f0" 
            strokeWidth="1" 
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />`
        : ""
      }
      
      {/* Lines */}
      {chartData.lines.map((line) => {
        const startPoint = chartData.points.find(p => p.id === line.startPointId);
        const endPoint = chartData.points.find(p => p.id === line.endPointId);
        const controlPoints = chartData.points.filter(p => line.controlPointIds.includes(p.id));
        
        if (!startPoint || !endPoint) return null;
        
        const hasControlPoints = controlPoints.length > 0;
        
        return (
          <g key={line.id}>
            {hasControlPoints ? (
              <motion.path
                d={generateCurvePath(startPoint, endPoint, controlPoints, padding)}
                fill="none"
                stroke={line.color}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            ) : (
              <motion.line
                x1={startPoint.x + padding}
                y1={startPoint.y + padding}
                x2={endPoint.x + padding}
                y2={endPoint.y + padding}
                stroke={line.color}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            )}
          </g>
        );
      })}
      
      {/* Points */}
      {chartData.points.map((point, index) => {
        const isControlPoint = point.id.startsWith("control-");
        
        // Skip control points in exported code
        if (isControlPoint) {
          return null;
        }
        
        return (
          <motion.g key={point.id}>
            <motion.circle
              cx={point.x + padding}
              cy={point.y + padding}
              r={isControlPoint ? "6" : "8"}
              fill={point.color}
              stroke={isControlPoint ? "#6d28d9" : point.color}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
            />
            {point.label && (
              <motion.text
                x={point.x + padding}
                y={point.y + padding - (isControlPoint ? 12 : 15)}
                textAnchor="middle"
                fontSize={isControlPoint ? "10" : "12"}
                fill={isControlPoint ? "#6d28d9" : point.color}
                fontWeight="500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1 + 0.2,
                }}
              >
                {point.label}
              </motion.text>
            )}
          </motion.g>
        );
      })}

      ${axesMode !== "off" ? generateAxesCode(axesMode) : ""}
    </svg>
  );
};

export default Chart;`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Export TypeScript Code
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                  aria-label="Fechar"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <CodeBlock
                language="typescript"
                filename="Chart.tsx"
                code={generateTypeScriptCode()}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
