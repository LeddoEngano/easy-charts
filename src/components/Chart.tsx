"use client";

import type { Line, LineStyle, Point, Text } from "@/types/chart";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EditableText } from "./EditableText";
import type { AxesMode } from "./Toolbar";

interface ChartProps {
  points: Point[];
  lines: Line[];
  texts: Text[];
  onPointClick?: (point: Point, event: React.MouseEvent) => void;
  onLineClick?: (line: Line, x: number, y: number) => void;
  onChartClick?: (x: number, y: number, event?: React.MouseEvent) => void;
  onPointDrag?: (pointId: string, x: number, y: number) => void;
  onLineMouseMove?: (line: Line, x: number, y: number) => void;
  onPointDragStart?: (pointId: string, startX: number, startY: number) => void;
  onPointDragEnd?: () => void;
  onTextClick?: (text: Text, event: React.MouseEvent) => void;
  onTextEdit?: (text: Text, event: React.MouseEvent) => void;
  onTextChange?: (textId: string, newContent: string) => void;
  onTextEditEnd?: (textId: string, finalContent: string) => void;
  onTextDragStart?: (
    textId: string,
    startX: number,
    startY: number,
    event: React.MouseEvent,
  ) => void;
  editingTextId?: string | null;
  isAddingPoints?: boolean;
  isAddingCurves?: boolean;
  isAddingText?: boolean;
  isDeletingLines?: boolean;
  draggedPointId?: string | null;
  hoveredLineId?: string | null;
  cursorPosition?: { x: number; y: number };
  controlPointPreview?: {
    lineId: string;
    x: number;
    y: number;
  } | null;

  onRestartAnimations?: () => void;
  onDownloadChart?: (format: "svg" | "png" | "gif") => void;
  axesMode?: AxesMode;
  showGrid?: boolean;
  width?: number;
  height?: number;

  // Canvas interaction hook
  canvasInteraction?: {
    handleItemInteraction: (item: any, event: React.MouseEvent) => boolean;
    handleItemDragStart: (
      item: any,
      startX: number,
      startY: number,
      event: React.MouseEvent,
    ) => boolean;
    handleCanvasClick: (x: number, y: number, event: React.MouseEvent) => void;
    shouldPreventToolActivation: boolean;
  };
}

export const Chart = ({
  points,
  lines,
  texts = [],
  onPointClick,
  onLineClick,
  onChartClick,
  onPointDrag,
  onLineMouseMove,
  onPointDragStart,
  onPointDragEnd,
  onTextClick,
  onTextEdit,
  onTextDragStart,
  isAddingPoints = false,
  isAddingCurves = false,
  isAddingText = false,
  isDeletingLines = false,
  draggedPointId = null,
  hoveredLineId = null,
  controlPointPreview = null,
  onRestartAnimations,
  onDownloadChart,
  axesMode = "off",
  showGrid = true,
  width = 800,
  height = 600,
  canvasInteraction,
}: ChartProps) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const padding = 40;

  // Function to get line style properties based on LineStyle
  const getLineStyleProperties = (style: LineStyle) => {
    switch (style) {
      case "solid":
        return {
          strokeDasharray: undefined,
          strokeWidth: "3",
        };
      case "dashed":
        return {
          strokeDasharray: "10,5",
          strokeWidth: "3",
        };
      case "dotted":
        return {
          strokeDasharray: "3,5",
          strokeWidth: "3",
        };
      case "dash-dot":
        return {
          strokeDasharray: "10,5,3,5",
          strokeWidth: "3",
        };
      case "thick":
        return {
          strokeDasharray: undefined,
          strokeWidth: "6",
        };
      case "thin":
        return {
          strokeDasharray: undefined,
          strokeWidth: "1",
        };
      default:
        return {
          strokeDasharray: undefined,
          strokeWidth: "3",
        };
    }
  };

  // Helper function to get strokeDasharray value for curves
  const getStrokeDasharrayForCurve = (style: LineStyle): string | undefined => {
    switch (style) {
      case "dashed":
        return "10,5";
      case "dotted":
        return "3,5";
      case "dash-dot":
        return "10,5,3,5";
      default:
        return undefined;
    }
  };

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".download-menu-container")) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadMenu]);

  const handleChartClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingPoints && !isAddingText) return;

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
      if (canvasInteraction) {
        canvasInteraction.handleCanvasClick(x, y, event);
      } else {
        onChartClick?.(x, y, event);
      }
    }
  };

  const calculateClosestPointOnLine = (
    event: React.MouseEvent<SVGElement>,
    line: Line,
  ) => {
    // Get SVG container coordinates, not the line element coordinates
    const svgElement = event.currentTarget.closest("svg");
    if (!svgElement) return null;

    const rect = svgElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left - padding;
    const clickY = event.clientY - rect.top - padding;

    // Get control points for this line
    const controlPoints = points.filter((p) =>
      line.controlPointIds.includes(p.id),
    );
    const hasControlPoints = controlPoints.length > 0;

    if (hasControlPoints) {
      // Calculate closest point on Bézier curve
      return calculateClosestPointOnBezierCurve(
        clickX,
        clickY,
        line.startPoint,
        line.endPoint,
        controlPoints,
      );
    } else {
      // Calculate the closest point on the straight line to the click position
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

      return { x: lineX, y: lineY };
    }
  };

  // Calculate closest point on Bézier curve using numerical approximation
  const calculateClosestPointOnBezierCurve = (
    clickX: number,
    clickY: number,
    startPoint: Point,
    endPoint: Point,
    controlPoints: Point[],
  ) => {
    let closestPoint = { x: startPoint.x, y: startPoint.y };
    let minDistance = Math.sqrt(
      (clickX - startPoint.x) ** 2 + (clickY - startPoint.y) ** 2,
    );

    // Check end point
    const endDistance = Math.sqrt(
      (clickX - endPoint.x) ** 2 + (clickY - endPoint.y) ** 2,
    );
    if (endDistance < minDistance) {
      minDistance = endDistance;
      closestPoint = { x: endPoint.x, y: endPoint.y };
    }

    // Sample the curve at regular intervals to find the closest point
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const pointOnCurve = getPointOnBezierCurve(
        t,
        startPoint,
        endPoint,
        controlPoints,
      );

      const distance = Math.sqrt(
        (clickX - pointOnCurve.x) ** 2 + (clickY - pointOnCurve.y) ** 2,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = pointOnCurve;
      }
    }

    return closestPoint;
  };

  // Get point on Bézier curve at parameter t
  const getPointOnBezierCurve = (
    t: number,
    startPoint: Point,
    endPoint: Point,
    controlPoints: Point[],
  ) => {
    if (controlPoints.length === 1) {
      // Quadratic Bézier curve
      const cp = controlPoints[0];
      const x =
        (1 - t) ** 2 * startPoint.x +
        2 * (1 - t) * t * cp.x +
        t ** 2 * endPoint.x;
      const y =
        (1 - t) ** 2 * startPoint.y +
        2 * (1 - t) * t * cp.y +
        t ** 2 * endPoint.y;
      return { x, y };
    } else if (controlPoints.length === 2) {
      // Cubic Bézier curve
      const cp1 = controlPoints[0];
      const cp2 = controlPoints[1];
      const x =
        (1 - t) ** 3 * startPoint.x +
        3 * (1 - t) ** 2 * t * cp1.x +
        3 * (1 - t) * t ** 2 * cp2.x +
        t ** 3 * endPoint.x;
      const y =
        (1 - t) ** 3 * startPoint.y +
        3 * (1 - t) ** 2 * t * cp1.y +
        3 * (1 - t) * t ** 2 * cp2.y +
        t ** 3 * endPoint.y;
      return { x, y };
    } else {
      // Multiple control points - use the same logic as generateComplexCurvePath
      // For now, we'll use a simplified approach with multiple quadratic curves
      if (controlPoints.length === 0) {
        // Fallback to straight line
        return {
          x: startPoint.x + t * (endPoint.x - startPoint.x),
          y: startPoint.y + t * (endPoint.y - startPoint.y),
        };
      }

      // For multiple control points, we need to determine which segment we're in
      const segmentCount = controlPoints.length;
      const segmentIndex = Math.floor(t * segmentCount);
      const segmentT = (t * segmentCount) % 1;

      if (segmentIndex === 0) {
        // First segment: from start to first control point
        const cp = controlPoints[0];
        const midX = (startPoint.x + cp.x) / 2;
        const midY = (startPoint.y + cp.y) / 2;

        const x =
          (1 - segmentT) ** 2 * startPoint.x +
          2 * (1 - segmentT) * segmentT * cp.x +
          segmentT ** 2 * midX;
        const y =
          (1 - segmentT) ** 2 * startPoint.y +
          2 * (1 - segmentT) * segmentT * cp.y +
          segmentT ** 2 * midY;
        return { x, y };
      } else if (segmentIndex >= segmentCount) {
        // Last segment: from last control point to end
        const cp = controlPoints[segmentCount - 1];
        const x =
          (1 - segmentT) ** 2 * cp.x +
          2 * (1 - segmentT) * segmentT * endPoint.x +
          segmentT ** 2 * endPoint.x;
        const y =
          (1 - segmentT) ** 2 * cp.y +
          2 * (1 - segmentT) * segmentT * endPoint.y +
          segmentT ** 2 * endPoint.y;
        return { x, y };
      } else {
        // Middle segments: between control points
        const cp1 = controlPoints[segmentIndex - 1];
        const cp2 = controlPoints[segmentIndex];
        const midX = (cp1.x + cp2.x) / 2;
        const midY = (cp1.y + cp2.y) / 2;

        const x =
          (1 - segmentT) ** 2 * cp1.x +
          2 * (1 - segmentT) * segmentT * cp2.x +
          segmentT ** 2 * midX;
        const y =
          (1 - segmentT) ** 2 * cp1.y +
          2 * (1 - segmentT) * segmentT * cp2.y +
          segmentT ** 2 * midY;
        return { x, y };
      }
    }
  };

  const handleLineClick = (event: React.MouseEvent<SVGElement>, line: Line) => {
    if (!isAddingCurves && !isDeletingLines) return;

    const closestPoint = calculateClosestPointOnLine(event, line);
    if (closestPoint) {
      onLineClick?.(line, closestPoint.x, closestPoint.y);
    }
  };

  const handleLineMouseMove = (
    event: React.MouseEvent<SVGElement>,
    line: Line,
  ) => {
    if (!isAddingCurves) return;

    const closestPoint = calculateClosestPointOnLine(event, line);
    if (closestPoint) {
      onLineMouseMove?.(line, closestPoint.x, closestPoint.y);
    }
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

    if (canvasInteraction) {
      const point = points.find((p) => p.id === pointId);
      if (point) {
        const canvasItem = {
          id: pointId,
          type: "point" as const,
          data: point,
        };
        canvasInteraction.handleItemDragStart(
          canvasItem,
          chartX,
          chartY,
          event,
        );
      }
    } else {
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
    }
  };

  const handlePointMouseUp = (point: Point, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (canvasInteraction) {
      // Use canvasInteraction for unified click/drag handling
      const canvasItem = {
        id: point.id,
        type: "point" as const,
        data: point,
      };
      canvasInteraction.handleItemInteraction(canvasItem, event!);
    } else {
      // Fallback to old system
      onPointDragEnd?.();
      if (event) {
        onPointClick?.(point, event);
      }
    }
  };

  const getCursorStyle = () => {
    if (isAddingPoints) return "crosshair";
    if (isAddingCurves) return "crosshair";
    if (isAddingText) return "text";
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
      const _x = e.clientX - rect.left;
      const _y = e.clientY - rect.top;
      // This will be handled by the parent component
    }
  };

  const getModeText = () => {
    if (isAddingPoints) return "Clique no gráfico para adicionar pontos";
    if (isAddingCurves)
      return "Clique em uma linha para adicionar ponto de controle (pode adicionar vários)";
    if (isAddingText) return "Clique no gráfico para adicionar texto";
    if (isDeletingLines) return "Clique em linhas ou pontos para deletar";
    return "";
  };

  // Helper functions for point styles
  const getPointStroke = (point: Point, isControlPoint: boolean) => {
    if (point.style === "hollow") return point.color;
    if (point.style === "border") return "#ffffff"; // White border for border style
    return isControlPoint ? "#6d28d9" : point.color;
  };

  const getPointStrokeWidth = (point: Point, _isControlPoint: boolean) => {
    if (point.style === "border") return "3";
    if (point.style === "hollow") return "3";
    return "0"; // No stroke for default style
  };

  const getPointFilter = (point: Point) => {
    if (point.style === "glow") {
      return `drop-shadow(0 0 12px ${point.color}) drop-shadow(0 0 8px ${point.color}) drop-shadow(0 0 4px ${point.color})`;
    }
    return "none";
  };

  const calculateLineLength = (startPoint: Point, endPoint: Point) => {
    return Math.sqrt(
      (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2,
    );
  };

  // Calculate approximate length of a curved path
  const _calculateCurveLength = (line: Line, controlPoints: Point[]) => {
    if (controlPoints.length === 0) {
      return calculateLineLength(line.startPoint, line.endPoint);
    }

    // Sample the curve at regular intervals to calculate approximate length
    const samples = 50;
    let totalLength = 0;
    let prevPoint = { x: line.startPoint.x, y: line.startPoint.y };

    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const currentPoint = getPointOnBezierCurve(
        t,
        line.startPoint,
        line.endPoint,
        controlPoints,
      );

      const segmentLength = Math.sqrt(
        (currentPoint.x - prevPoint.x) ** 2 +
          (currentPoint.y - prevPoint.y) ** 2,
      );

      totalLength += segmentLength;
      prevPoint = currentPoint;
    }

    return totalLength;
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
      className="relative bg-white border border-gray-200 rounded-lg shadow-lg outline-none focus:outline-none chart-container"
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      role="application"
      aria-label="Interactive chart"
    >
      {/* Restart animations button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute cursor-pointer top-0 left-0 z-20 bg-gray-800 text-white p-2 rounded-tl-lg rounded-br-lg hover:bg-gray-700 transition-colors shadow-lg"
        onClick={onRestartAnimations}
        title="Reiniciar Animações"
        style={{
          transform: "translateY(-1px)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">Animations</span>
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
        </div>
      </motion.button>

      {/* Download button tab */}
      <div className="absolute top-0 right-0 z-20 download-menu-container">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-800 cursor-pointer text-white px-3 py-2 rounded-tr-lg rounded-bl-lg font-medium text-sm hover:bg-gray-700 transition-colors shadow-lg"
          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
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
            aria-label="Download"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </motion.button>

        {/* Download menu */}
        {showDownloadMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px]"
          >
            <button
              type="button"
              onClick={() => {
                onDownloadChart?.("svg");
                setShowDownloadMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-label="Download SVG"
              >
                <title>Download SVG</title>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              SVG
            </button>
            <button
              type="button"
              onClick={() => {
                onDownloadChart?.("png");
                setShowDownloadMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-label="Download PNG"
              >
                <title>Download PNG</title>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              PNG
            </button>
          </motion.div>
        )}
      </div>
      {/* Grid background */}
      {showGrid && (
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
      )}

      {/* Axes */}
      {axesMode !== "off" && (
        <svg
          width={width}
          height={height}
          className="absolute inset-0 pointer-events-none"
          role="img"
          aria-label="Chart axes"
        >
          {axesMode === "quadrants" ? (
            // 4 Quadrants Mode - Center axes
            <>
              {/* X Axis */}
              <motion.line
                x1={padding}
                y1={height / 2}
                x2={width - padding}
                y2={height / 2}
                stroke="#374151"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              {/* Y Axis */}
              <motion.line
                x1={width / 2}
                y1={padding}
                x2={width / 2}
                y2={height - padding}
                stroke="#374151"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
              />

              {/* X Axis Arrows */}
              <motion.polygon
                points={`${width - padding - 10},${height / 2 - 5} ${width - padding},${height / 2} ${width - padding - 10},${height / 2 + 5}`}
                fill="#374151"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              />
              <motion.polygon
                points={`${padding + 10},${height / 2 - 5} ${padding},${height / 2} ${padding + 10},${height / 2 + 5}`}
                fill="#374151"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              />

              {/* Y Axis Arrows */}
              <motion.polygon
                points={`${width / 2 - 5},${padding + 10} ${width / 2},${padding} ${width / 2 + 5},${padding + 10}`}
                fill="#374151"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              />
              <motion.polygon
                points={`${width / 2 - 5},${height - padding - 10} ${width / 2},${height - padding} ${width / 2 + 5},${height - padding - 10}`}
                fill="#374151"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              />
            </>
          ) : (
            // Single Quadrant Mode - Bottom-left origin
            <>
              {/* X Axis */}
              <motion.line
                x1={padding}
                y1={height - padding}
                x2={width - padding}
                y2={height - padding}
                stroke="#374151"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              {/* Y Axis */}
              <motion.line
                x1={padding}
                y1={height - padding}
                x2={padding}
                y2={padding}
                stroke="#374151"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
              />

              {/* X Axis Arrow */}
              <motion.polygon
                points={`${width - padding - 10},${height - padding - 5} ${width - padding},${height - padding} ${width - padding - 10},${height - padding + 5}`}
                fill="#374151"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              />

              {/* Y Axis Arrow */}
              <motion.polygon
                points={`${padding - 5},${padding + 10} ${padding},${padding} ${padding + 5},${padding + 10}`}
                fill="#374151"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              />

              {/* X Axis Label */}
              <motion.text
                x={width - padding - 20}
                y={height - padding + 25}
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
                x={padding - 25}
                y={padding + 20}
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
            </>
          )}
        </svg>
      )}

      {/* Chart area */}
      <svg
        width={width}
        height={height}
        className="relative z-10 outline-none focus:outline-none chart-svg"
        role="img"
        aria-label="Chart with points and lines"
        tabIndex={-1}
        onClick={handleChartClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleChartClick(e as any);
          }
        }}
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
            <g
              key={`${line.id}-${line.startPoint.x}-${line.startPoint.y}-${line.endPoint.x}-${line.endPoint.y}`}
            >
              {/* Invisible clickable area for line */}
              {hasControlPoints ? (
                /* Clickable area that follows the Bézier curve */
                <path
                  d={generateComplexCurvePath(line, controlPoints, padding)}
                  fill="none"
                  stroke={
                    isHovered ? "rgba(255, 255, 255, 0.3)" : "transparent"
                  }
                  strokeWidth={isHovered ? "25" : "20"}
                  strokeLinecap="round"
                  role="button"
                  aria-label={`Interagir com linha ${line.id}`}
                  onClick={(e) => handleLineClick(e, line)}
                  onMouseMove={(e) => handleLineMouseMove(e, line)}
                  onMouseLeave={() => onLineMouseMove?.(line, 0, 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleLineClick(e as any, line);
                    }
                  }}
                  tabIndex={isAddingCurves || isDeletingLines ? 0 : -1}
                  style={{
                    cursor:
                      isAddingCurves || isDeletingLines
                        ? "crosshair"
                        : "default",
                  }}
                />
              ) : (
                /* Clickable area for straight line */
                <line
                  x1={line.startPoint.x + padding}
                  y1={line.startPoint.y + padding}
                  x2={line.endPoint.x + padding}
                  y2={line.endPoint.y + padding}
                  stroke={
                    isHovered ? "rgba(255, 255, 255, 0.3)" : "transparent"
                  }
                  strokeWidth={isHovered ? "25" : "20"}
                  strokeLinecap="round"
                  role="button"
                  aria-label={`Interagir com linha ${line.id}`}
                  onClick={(e) => handleLineClick(e, line)}
                  onMouseMove={(e) => handleLineMouseMove(e, line)}
                  onMouseLeave={() => onLineMouseMove?.(line, 0, 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleLineClick(e as any, line);
                    }
                  }}
                  tabIndex={isAddingCurves || isDeletingLines ? 0 : -1}
                  style={{
                    cursor:
                      isAddingCurves || isDeletingLines
                        ? "crosshair"
                        : "default",
                  }}
                />
              )}

              {/* Show either straight line or curved path */}
              {hasControlPoints
                ? /* Complex curved path with multiple control points */
                  (() => {
                    const styleProps = getLineStyleProperties(line.style);

                    // Usar função helper para garantir strokeDasharray correto
                    const strokeDashArrayValue = getStrokeDasharrayForCurve(
                      line.style,
                    );

                    // Criar path com propriedades específicas baseado no estilo
                    const pathProps = {
                      d: generateComplexCurvePath(line, controlPoints, padding),
                      fill: "none",
                      stroke: line.color,
                      strokeWidth: isHovered ? "5" : styleProps.strokeWidth,
                      strokeLinecap: "round" as const,
                      style: {
                        filter: isHovered
                          ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))"
                          : "none",
                      },
                    };

                    const key = `curved-${line.id}-${controlPoints.length}-${line.style}`;

                    // Aplicar strokeDasharray baseado no estilo
                    if (strokeDashArrayValue) {
                      return (
                        <motion.path
                          key={key}
                          {...pathProps}
                          strokeDasharray={strokeDashArrayValue}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      );
                    } else {
                      // Para linhas sólidas, usar pathLength para animação
                      return (
                        <motion.path
                          key={key}
                          {...pathProps}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            delay: 0.3,
                          }}
                        />
                      );
                    }
                  })()
                : /* Straight line with drawing animation from A to B */
                  (() => {
                    const lineLength = calculateLineLength(
                      line.startPoint,
                      line.endPoint,
                    );

                    return (
                      <motion.path
                        key={`straight-${line.id}-${line.startPoint.x}-${line.startPoint.y}-${line.endPoint.x}-${line.endPoint.y}`}
                        d={`M ${line.startPoint.x + padding} ${line.startPoint.y + padding} L ${line.endPoint.x + padding} ${line.endPoint.y + padding}`}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={
                          isHovered
                            ? "5"
                            : getLineStyleProperties(line.style).strokeWidth
                        }
                        strokeLinecap="round"
                        strokeDasharray={
                          getLineStyleProperties(line.style).strokeDasharray
                        }
                        initial={{
                          strokeDasharray: `${lineLength} ${lineLength}`,
                          strokeDashoffset: lineLength,
                        }}
                        animate={{
                          strokeDasharray: getLineStyleProperties(line.style)
                            .strokeDasharray,
                          strokeDashoffset: 0,
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: 0.2,
                        }}
                        style={{
                          filter: isHovered
                            ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))"
                            : "none",
                        }}
                      />
                    );
                  })()}
            </g>
          );
        })}

        {/* Control Point Preview */}
        {isAddingCurves && controlPointPreview && (
          <motion.circle
            cx={controlPointPreview.x + padding}
            cy={controlPointPreview.y + padding}
            r="6"
            fill="rgba(139, 92, 246, 0.3)"
            stroke="#8b5cf6"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* Points */}
        {points.map((point, index) => {
          const isControlPoint = point.id.startsWith("control-");
          const isDragging = draggedPointId === point.id;

          // Hide control points when not in curve editing mode or delete mode
          if (isControlPoint && !isAddingCurves && !isDeletingLines) {
            return null;
          }

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
                  role="button"
                  tabIndex={0}
                  aria-label={`Interagir com ponto ${point.id}`}
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
                      point.style === "hollow"
                        ? "#ffffff"
                        : point.style === "border"
                          ? point.color
                          : point.color
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

                  {/* Additional border for border style to make it more visible */}
                  {point.style === "border" && (
                    <circle
                      cx={point.x + padding}
                      cy={point.y + padding}
                      r={isControlPoint ? "6" : "8"}
                      fill="transparent"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ pointerEvents: "none" }}
                    />
                  )}

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

        {/* Texts */}
        {texts.map((text) => (
          <g key={text.id}>
            <EditableText text={text} />
            {/* Invisible overlay for interaction handling */}
            <rect
              x={text.x - 5}
              y={text.y - text.fontSize - 5}
              width={text.content.length * (text.fontSize * 0.6) + 10}
              height={text.fontSize + 10}
              fill="transparent"
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`Editar texto: ${text.content}`}
              onMouseUp={(e) => {
                e.stopPropagation(); // Prevent event from bubbling to canvas

                if (canvasInteraction) {
                  const canvasItem = {
                    id: text.id,
                    type: "text" as const,
                    data: text,
                  };
                  canvasInteraction.handleItemInteraction(canvasItem, e);
                } else {
                  onTextClick?.(text, e);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling to canvas
                onTextEdit?.(text, e);
              }}
              onMouseDown={(e) => {
                e.stopPropagation(); // Prevent event from bubbling to canvas

                if (canvasInteraction) {
                  const canvasItem = {
                    id: text.id,
                    type: "text" as const,
                    data: text,
                  };
                  canvasInteraction.handleItemDragStart(
                    canvasItem,
                    e.clientX,
                    e.clientY,
                    e,
                  );
                } else {
                  onTextDragStart?.(text.id, e.clientX, e.clientY, e);
                }
              }}
            />
          </g>
        ))}

        {/* Visual indicator when adding points mode is active */}
        {(isAddingPoints || isAddingCurves || isAddingText) && (
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
