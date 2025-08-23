"use client";

import { motion } from "framer-motion";
import type { Line, Point } from "@/types/chart";

interface ChartProps {
  points: Point[];
  lines: Line[];
  onPointClick?: (point: Point, event: React.MouseEvent) => void;
  onLineClick?: (line: Line, x: number, y: number) => void;
  onChartClick?: (x: number, y: number) => void;
  onPointDrag?: (pointId: string, x: number, y: number) => void;
  onPointDragStart?: (pointId: string, startX: number, startY: number) => void;
  onPointDragEnd?: () => void;
  isAddingPoints?: boolean;
  isAddingCurves?: boolean;
  isDeletingLines?: boolean;
  draggedPointId?: string | null;
  hoveredLineId?: string | null;
  cursorPosition?: { x: number; y: number };
  onOpenCodeDrawer?: () => void;
  onRestartAnimations?: () => void;
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
  isDeletingLines = false,
  draggedPointId = null,
  hoveredLineId = null,
  cursorPosition = { x: 0, y: 0 },
  onOpenCodeDrawer,
  onRestartAnimations,
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
    if (!isAddingCurves && !isDeletingLines) return;

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
    startX: number,
    startY: number,
  ) => {
    event.stopPropagation();
    event.preventDefault(); // Also prevent default behavior

    // Convert screen coordinates to chart coordinates
    const svgElement = event.currentTarget.closest("svg");
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const chartX = startX - rect.left - padding;
    const chartY = startY - rect.top - padding;

    onPointDragStart?.(pointId, chartX, chartY);

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

  const handlePointMouseUp = (point: Point, event?: React.MouseEvent) => {
    console.log(
      "🟡 handlePointMouseUp called for point:",
      point.id,
      "with event:",
      !!event,
    );

    if (event) {
      event.stopPropagation();
      event.preventDefault(); // Also prevent default behavior
    }
    onPointDragEnd?.();

    // Only trigger click logic if we have an event
    if (event) {
      console.log("📤 About to call onPointClick for point:", point.id);
      console.log("📤 onPointClick function exists:", !!onPointClick);
      onPointClick?.(point, event);
      console.log("📤 onPointClick called successfully");
    } else {
      console.log("❌ No event provided to handlePointMouseUp");
    }
  };

  const getCursorStyle = () => {
    if (isAddingPoints) return "crosshair";
    if (isAddingCurves) return "crosshair";
    if (isDeletingLines) return "crosshair";
    return "default";
  };

  const getPointCursorStyle = (isDragging: boolean) => {
    if (isDeletingLines) return "pointer"; // Show pointer for delete mode
    if (isDragging) return "grabbing";
    return "grab";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDeletingLines) {
      // Update cursor position for the trash icon
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // This will be handled by the parent component
    }
  };

  const getModeText = () => {
    if (isAddingPoints) return "Clique no gráfico para adicionar pontos";
    if (isAddingCurves)
      return "Clique em uma linha para adicionar ponto de controle (pode adicionar vários)";
    if (isDeletingLines) return "Clique em linhas ou pontos para deletar";
    return "";
  };

  // Helper functions for point styles
  const getPointStroke = (point: Point, isControlPoint: boolean) => {
    if (point.style === "hollow") return point.color;
    if (point.style === "border") return point.color;
    return isControlPoint ? "#6d28d9" : point.color;
  };

  const getPointStrokeWidth = (point: Point, isControlPoint: boolean) => {
    if (point.style === "border") return "4";
    if (point.style === "hollow") return "2";
    return "2";
  };

  const getPointFilter = (point: Point) => {
    if (point.style === "glow") {
      return `drop-shadow(0 0 8px ${point.color}) drop-shadow(0 0 4px ${point.color})`;
    }
    return "none";
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
      onMouseMove={handleMouseMove}
    >
      {/* Restart animations button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-0 left-0 z-20 bg-gray-800 text-white p-2 rounded-br-lg hover:bg-gray-700 transition-colors shadow-lg"
        onClick={onRestartAnimations}
        title="Reiniciar Animações"
        style={{
          transform: "translateY(-1px)",
        }}
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
          aria-label="Reiniciar animações"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      </motion.button>

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
            role="img"
            aria-label="Código"
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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleChartClick(e as any);
          }
        }}
        tabIndex={0}
        style={{ cursor: getCursorStyle() }}
      >
        {/* Lines between points */}
        {lines.map((line) => {
          const controlPoints = points.filter((p) =>
            line.controlPointIds.includes(p.id),
          );
          const hasControlPoints = controlPoints.length > 0;
          const isHovered = hoveredLineId === line.id;

          return (
            <g key={line.id}>
              {/* Invisible clickable area for line */}
              <line
                x1={line.startPoint.x + padding}
                y1={line.startPoint.y + padding}
                x2={line.endPoint.x + padding}
                y2={line.endPoint.y + padding}
                stroke={isHovered ? "rgba(255, 255, 255, 0.3)" : "transparent"}
                strokeWidth={isHovered ? "25" : "20"}
                strokeLinecap="round"
                onClick={(e) => handleLineClick(e, line)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLineClick(e as any, line);
                  }
                }}
                tabIndex={isAddingCurves || isDeletingLines ? 0 : -1}
                style={{
                  cursor:
                    isAddingCurves || isDeletingLines ? "crosshair" : "default",
                }}
              />

              {/* Show either straight line or curved path */}
              {hasControlPoints ? (
                /* Complex curved path with multiple control points */
                <motion.path
                  d={generateComplexCurvePath(line, controlPoints, padding)}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={isHovered ? "5" : "3"}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                  style={{
                    filter: isHovered
                      ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))"
                      : "none",
                  }}
                />
              ) : (
                /* Straight line when no control points */
                <motion.line
                  x1={line.startPoint.x + padding}
                  y1={line.startPoint.y + padding}
                  x2={line.endPoint.x + padding}
                  y2={line.endPoint.y + padding}
                  stroke={line.color}
                  strokeWidth={isHovered ? "5" : "3"}
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
                    filter: isHovered
                      ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))"
                      : "none",
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
              {/* Hidden points - invisible but clickable */}
              {point.style === "hidden" ? (
                <circle
                  cx={point.x + padding}
                  cy={point.y + padding}
                  r={isControlPoint ? "6" : "8"}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="0"
                  onMouseDown={(e) =>
                    handlePointMouseDown(e, point.id, e.clientX, e.clientY)
                  }
                  onMouseUp={(e) => handlePointMouseUp(point, e)}
                  className="cursor-pointer"
                  style={{
                    cursor: getPointCursorStyle(isDragging),
                    zIndex: isDragging ? 1000 : 1,
                  }}
                />
              ) : (
                <>
                  {/* Visible point circle with different styles */}
                  <motion.circle
                    cx={point.x + padding}
                    cy={point.y + padding}
                    r={isControlPoint ? "6" : "8"}
                    fill={
                      point.style === "hollow" ? "transparent" : point.color
                    }
                    stroke={getPointStroke(point, isControlPoint)}
                    strokeWidth={getPointStrokeWidth(point, isControlPoint)}
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
                    onMouseDown={(e) =>
                      handlePointMouseDown(e, point.id, e.clientX, e.clientY)
                    }
                    onMouseUp={(e) => handlePointMouseUp(point, e)}
                    className="cursor-pointer"
                    style={{
                      cursor: getPointCursorStyle(isDragging),
                      zIndex: isDragging ? 1000 : 1,
                      filter: getPointFilter(point),
                    }}
                  />

                  {/* Additional circles for radar effect - rendered first so they don't interfere with interaction */}
                  {point.style === "radar" && (
                    <>
                      <circle
                        cx={point.x + padding}
                        cy={point.y + padding}
                        r={isControlPoint ? "10" : "12"}
                        fill="transparent"
                        stroke={point.color}
                        strokeWidth="1"
                        opacity="0.6"
                        style={{ pointerEvents: "none" }}
                      />
                      <circle
                        cx={point.x + padding}
                        cy={point.y + padding}
                        r={isControlPoint ? "14" : "16"}
                        fill="transparent"
                        stroke={point.color}
                        strokeWidth="1"
                        opacity="0.3"
                        style={{ pointerEvents: "none" }}
                      />
                    </>
                  )}
                </>
              )}

              {/* Point label */}
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
