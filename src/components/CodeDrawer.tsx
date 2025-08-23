"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ChartData } from "@/types/chart";
import { CodeBlock } from "@/components/ui/code-block";

interface CodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ChartData;
}

export const CodeDrawer = ({ isOpen, onClose, chartData }: CodeDrawerProps) => {
  const generateTypeScriptCode = () => {
    const pointsCode = chartData.points
      .map(
        (point) =>
          `  { id: "${point.id}", x: ${point.x}, y: ${point.y}${point.label ? `, label: "${point.label}"` : ""} }`,
      )
      .join(",\n");

    const linesCode = chartData.lines
      .map(
        (line) => `  { 
      id: "${line.id}", 
      startPointId: "${line.startPointId}", 
      endPointId: "${line.endPointId}",
      controlPointIds: [${line.controlPointIds.map((id) => `"${id}"`).join(", ")}]
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
}

interface Line {
  id: string;
  startPointId: string;
  endPointId: string;
  controlPointIds: string[];
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
      className="bg-white border border-gray-200 rounded-lg shadow-lg"
      role="img"
      aria-label="Chart with points and lines"
    >
      {/* Grid background */}
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
      <rect width="100%" height="100%" fill="url(#grid)" />
      
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
                stroke="#8b5cf6"
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
                stroke="#3b82f6"
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
        
        return (
          <motion.g key={point.id}>
            <motion.circle
              cx={point.x + padding}
              cy={point.y + padding}
              r={isControlPoint ? "6" : "8"}
              fill={isControlPoint ? "#8b5cf6" : "#3b82f6"}
              stroke={isControlPoint ? "#6d28d9" : "#1e40af"}
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
                fill={isControlPoint ? "#6d28d9" : "#374151"}
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
