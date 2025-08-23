"use client";

import { motion } from "framer-motion";
import type { Line, Point } from "@/types/chart";

interface ChartProps {
  points: Point[];
  lines: Line[];
  onPointClick?: (point: Point) => void;
  onLineClick?: (line: Line, x: number, y: number) => void;
  onChartClick?: (x: number, y: number) => void;
  onPointDrag?: (pointId: string, x: number, y: number) => void;
  onPointDragStart?: (pointId: string) => void;
  onPointDragEnd?: () => void;
  isAddingPoints?: boolean;
  isAddingCurves?: boolean;
  draggedPointId?: string | null;
  onOpenCodeDrawer?: () => void;
  width?: number;
  height?: number;
}

export const Chart = ({
  points,
  lines,
  onPointClick,
  onLineClick,
  onChartClick,
  onPointDrag,
  onPointDragStart,
  onPointDragEnd,
  isAddingPoints = false,
  isAddingCurves = false,
  draggedPointId = null,
  onOpenCodeDrawer,
  width = 800,
  height = 600,
}: ChartProps) => {
  const padding = 40;

  const handleChartClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingPoints) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - padding;
    const y = event.clientY - rect.top - padding;

    // Ensure click is within chart bounds
    if (
      x >= 0 &&
      x <= width - 2 * padding &&
      y >= 0 &&
      y <= height - 2 * padding
    ) {
      onChartClick?.(x, y);
    }
  };

  const handleLineClick = (event: React.MouseEvent<SVGElement>, line: Line) => {
    if (!isAddingCurves) return;

    // Get SVG container coordinates, not the line element coordinates
    const svgElement = event.currentTarget.closest("svg");
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left - padding;
    const clickY = event.clientY - rect.top - padding;

    // Calculate the closest point on the line to the click position
    const { startPoint, endPoint } = line;
    const A = clickX - startPoint.x;
    const B = clickY - startPoint.y;
    const C = endPoint.x - startPoint.x;
    const D = endPoint.y - startPoint.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = 0;

    if (lenSq !== 0) param = dot / lenSq;

    // Clamp parameter to line segment (0 to 1)
    param = Math.max(0, Math.min(1, param));

    // Calculate the exact point on the line
    const lineX = startPoint.x + param * C;
    const lineY = startPoint.y + param * D;

    onLineClick?.(line, lineX, lineY);
  };

  const handlePointMouseDown = (
    event: React.MouseEvent<SVGElement>,
    pointId: string,
  ) => {
    event.stopPropagation();
    onPointDragStart?.(pointId);

    // Get the SVG container for proper coordinate calculation
    const svgElement = event.currentTarget.closest("svg");
    if (!svgElement) return;

    // Add global mouse event listeners for better drag handling
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = svgElement.getBoundingClientRect();
      const x = e.clientX - rect.left - padding;
      const y = e.clientY - rect.top - padding;

      // Ensure point stays within chart bounds
      const clampedX = Math.max(0, Math.min(x, width - 2 * padding));
      const clampedY = Math.max(0, Math.min(y, height - 2 * padding));

      onPointDrag?.(pointId, clampedX, clampedY);
    };

    const handleGlobalMouseUp = () => {
      onPointDragEnd?.();
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };

  const handlePointMouseUp = () => {
    onPointDragEnd?.();
  };

  const getCursorStyle = () => {
    if (isAddingPoints) return "crosshair";
    if (isAddingCurves) return "crosshair";
    return "default";
  };

  const getModeText = () => {
    if (isAddingPoints) return "Clique no gráfico para adicionar pontos";
    if (isAddingCurves)
      return "Clique em uma linha para adicionar ponto de controle (pode adicionar vários)";
    return "";
  };

  const generateComplexCurvePath = (
    line: Line,
    controlPoints: Point[],
    padding: number,
  ) => {
    if (controlPoints.length === 1) {
      // Single control point - simple quadratic curve
      const cp = controlPoints[0];
      return `M ${line.startPoint.x + padding} ${line.startPoint.y + padding} Q ${cp.x + padding} ${cp.y + padding} ${line.endPoint.x + padding} ${line.endPoint.y + padding}`;
    } else if (controlPoints.length === 2) {
      // Two control points - cubic curve
      const cp1 = controlPoints[0];
      const cp2 = controlPoints[1];
      return `M ${line.startPoint.x + padding} ${line.startPoint.y + padding} C ${cp1.x + padding} ${cp1.y + padding} ${cp2.x + padding} ${cp2.y + padding} ${line.endPoint.x + padding} ${line.endPoint.y + padding}`;
    } else {
      // Multiple control points - create a smooth curve through all points
      // We'll create a series of connected quadratic curves
      let path = `M ${line.startPoint.x + padding} ${line.startPoint.y + padding}`;

      // For multiple control points, we'll create individual quadratic curves
      for (let i = 0; i < controlPoints.length; i++) {
        const cp = controlPoints[i];
        if (i === 0) {
          // First segment: from start to first control point
          const midX = (line.startPoint.x + cp.x) / 2;
          const midY = (line.startPoint.y + cp.y) / 2;
          path += ` Q ${cp.x + padding} ${cp.y + padding} ${midX + padding} ${midY + padding}`;
        } else if (i === controlPoints.length - 1) {
          // Last segment: from previous to end through last control point
          path += ` Q ${cp.x + padding} ${cp.y + padding} ${line.endPoint.x + padding} ${line.endPoint.y + padding}`;
        } else {
          // Middle segments: from previous control point to next
          const nextCp = controlPoints[i + 1];
          const midX = (cp.x + nextCp.x) / 2;
          const midY = (cp.y + nextCp.y) / 2;
          path += ` Q ${cp.x + padding} ${cp.y + padding} ${midX + padding} ${midY + padding}`;
        }
      }

      return path;
    }
  };

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{ width, height }}
    >
      {/* Code button tab */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-0 right-0 z-20 bg-gray-800 text-white px-4 py-2 rounded-bl-lg font-medium text-sm hover:bg-gray-700 transition-colors shadow-lg"
        onClick={onOpenCodeDrawer}
        style={{
          transform: "translateY(-1px)",
        }}
      >
        <span className="flex items-center gap-2">
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
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Code
        </span>
      </motion.button>
      {/* Grid background */}
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        role="img"
        aria-label="Grid background"
      >
        <defs>
          <pattern
            id="grid"
            width={20}
            height={20}
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
      </svg>

      {/* Chart area */}
      <svg
        width={width}
        height={height}
        className="relative z-10"
        role="img"
        aria-label="Chart with points and lines"
        onClick={handleChartClick}
        style={{ cursor: getCursorStyle() }}
      >
        {/* Lines between points */}
        {lines.map((line) => {
          const controlPoints = points.filter((p) =>
            line.controlPointIds.includes(p.id),
          );
          const hasControlPoints = controlPoints.length > 0;

          return (
            <g key={line.id}>
              {/* Invisible clickable area for line */}
              <line
                x1={line.startPoint.x + padding}
                y1={line.startPoint.y + padding}
                x2={line.endPoint.x + padding}
                y2={line.endPoint.y + padding}
                stroke="transparent"
                strokeWidth="20"
                strokeLinecap="round"
                onClick={(e) => handleLineClick(e, line)}
                role="button"
                tabIndex={isAddingCurves ? 0 : -1}
                style={{
                  cursor: isAddingCurves ? "crosshair" : "default",
                }}
              />

              {/* Show either straight line or curved path */}
              {hasControlPoints ? (
                /* Complex curved path with multiple control points */
                <motion.path
                  d={generateComplexCurvePath(line, controlPoints, padding)}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                />
              ) : (
                /* Straight line when no control points */
                <motion.line
                  x1={line.startPoint.x + padding}
                  y1={line.startPoint.y + padding}
                  x2={line.endPoint.x + padding}
                  y2={line.endPoint.y + padding}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                  style={{
                    strokeDasharray: isAddingCurves ? "5,5" : "none",
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Points */}
        {points.map((point, index) => {
          const isControlPoint = point.id.startsWith("control-");
          const isDragging = draggedPointId === point.id;

          return (
            <motion.g key={point.id}>
              {/* Point circle */}
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
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={(e) => handlePointMouseDown(e, point.id)}
                onMouseUp={handlePointMouseUp}
                onClick={(e) => {
                  e.stopPropagation();
                  onPointClick?.(point);
                }}
                className="cursor-pointer"
                style={{
                  cursor: isDragging ? "grabbing" : "grab",
                  zIndex: isDragging ? 1000 : 1,
                }}
              />

              {/* Point label */}
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

        {/* Visual indicator when adding points mode is active */}
        {(isAddingPoints || isAddingCurves) && (
          <motion.text
            x={width / 2}
            y={height - 20}
            textAnchor="middle"
            fontSize="14"
            fill="#6b7280"
            fontWeight="500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none"
          >
            {getModeText()}
          </motion.text>
        )}
      </svg>
    </div>
  );
};
