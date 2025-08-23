import { useCallback, useState } from "react";
import type { ChartData, Line, Point, PointStyle } from "@/types/chart";

export const useChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    points: [],
    lines: [],
  });

  const [isAddingPoints, setIsAddingPoints] = useState(true);
  const [isAddingCurves, setIsAddingCurves] = useState(false);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#3b82f6"); // Default blue
  const [isNewLineMode, setIsNewLineMode] = useState(false);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [isDeletingLines, setIsDeletingLines] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [pointStyleMenu, setPointStyleMenu] = useState<{
    pointId: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [actuallyDragged, setActuallyDragged] = useState(false);
  const [dragMoveCount, setDragMoveCount] = useState(0);

  // Add a new point to the chart
  const addPoint = useCallback(
    (x: number, y: number, label?: string) => {
      const newPoint: Point = {
        id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        label,
        color: currentColor, // Use current color for new points
        style: "default", // Default style for new points
      };

      setChartData((prev) => {
        const newPoints = [...prev.points, newPoint];
        const newLines = [...prev.lines];

        // Logic for creating lines
        if (isNewLineMode) {
          // In new line mode, don't create a line automatically
          setIsNewLineMode(false); // Reset after adding first point of new line
        } else if (newPoints.length >= 2) {
          // Create a line between the last two points
          const lastPoint = newPoints[newPoints.length - 1];
          const secondLastPoint = newPoints[newPoints.length - 2];

          // Only create line if the second last point is not already connected to another line as an end point
          // or if we're starting a completely new line
          const shouldCreateLine =
            prev.lines.length === 0 ||
            !prev.lines.some((line) => line.endPointId === secondLastPoint.id);

          if (shouldCreateLine) {
            const newLine: Line = {
              id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              startPointId: secondLastPoint.id,
              endPointId: lastPoint.id,
              startPoint: secondLastPoint,
              endPoint: lastPoint,
              controlPointIds: [],
              color: currentColor,
            };

            newLines.push(newLine);
          }
        }

        return {
          points: newPoints,
          lines: newLines,
        };
      });
    },
    [isNewLineMode, currentColor],
  );

  // Add point by click coordinates (for chart click)
  const addPointByClick = useCallback(
    (x: number, y: number) => {
      if (isAddingPoints) {
        const pointNumber = chartData.points.length + 1;
        addPoint(x, y, `P${pointNumber}`);
      }
    },
    [isAddingPoints, chartData.points.length, addPoint],
  );

  // Add control point to a line
  const addControlPointToLine = useCallback(
    (lineId: string, x: number, y: number) => {
      if (!isAddingCurves) return;

      // Create control point
      const controlPoint: Point = {
        id: `control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        label: `CP${chartData.points.filter((p) => p.id.startsWith("control-")).length + 1}`,
        color: "#8b5cf6", // Purple for control points
        style: "default", // Default style for control points
      };

      setChartData((prev) => ({
        points: [...prev.points, controlPoint],
        lines: prev.lines.map((line) =>
          line.id === lineId
            ? {
                ...line,
                controlPointIds: [...line.controlPointIds, controlPoint.id],
              }
            : line,
        ),
      }));

      // Deactivate curve mode after adding
      setIsAddingCurves(false);
    },
    [isAddingCurves, chartData.points],
  );

  // Update point position (for dragging)
  const updatePointPosition = useCallback(
    (pointId: string, x: number, y: number) => {
      console.log(
        "📍 updatePointPosition called for point:",
        pointId,
        "at position:",
        { x, y },
      );

      // Increment move count - this indicates actual dragging
      setDragMoveCount((prev) => {
        const newCount = prev + 1;
        console.log("🔢 Drag move count:", newCount);

        // If we have multiple moves, it's definitely a drag
        if (newCount > 2) {
          setActuallyDragged(true);
          console.log("🔴 Multiple moves detected - marking as dragged");
        }

        return newCount;
      });

      // Also check distance for single moves
      if (dragStartPosition) {
        const distance = Math.sqrt(
          Math.pow(x - dragStartPosition.x, 2) +
            Math.pow(y - dragStartPosition.y, 2),
        );

        console.log(
          "📏 Movement distance:",
          distance,
          "pixels from",
          dragStartPosition,
          "to",
          { x, y },
        );

        if (distance > 8) {
          setActuallyDragged(true);
          console.log("🔴 Large distance movement - marking as dragged");
        }
      }

      setChartData((prev) => {
        const updatedPoints = prev.points.map((point) =>
          point.id === pointId ? { ...point, x, y } : point,
        );

        const updatedPoint = updatedPoints.find((p) => p.id === pointId);

        return {
          points: updatedPoints,
          lines: prev.lines.map((line) => {
            // Update line references if the moved point is a start or end point
            if (line.startPointId === pointId && updatedPoint) {
              return { ...line, startPoint: updatedPoint };
            }
            if (line.endPointId === pointId && updatedPoint) {
              return { ...line, endPoint: updatedPoint };
            }
            return line;
          }),
        };
      });
    },
    [dragStartPosition],
  );

  // Start dragging a point
  const startDragging = useCallback(
    (pointId: string, startX: number, startY: number) => {
      console.log("=== startDragging called ===");
      console.log("Point ID:", pointId, "Start position:", {
        x: startX,
        y: startY,
      });

      setDraggedPointId(pointId);
      setDragStartPosition({ x: startX, y: startY });
      setIsDragging(true);
      setActuallyDragged(false); // Reset - will be set to true if actually moved
      setDragMoveCount(0); // Reset move counter

      console.log("States after startDragging:", {
        isDragging: true,
        actuallyDragged: false,
        dragMoveCount: 0,
        dragStartPosition: { x: startX, y: startY },
      });
    },
    [],
  );

  // Stop dragging
  const stopDragging = useCallback(() => {
    console.log("=== stopDragging called ===");
    console.log("Current states before reset:", {
      isDragging,
      actuallyDragged,
    });

    setDraggedPointId(null);
    setDragStartPosition(null);
    setIsDragging(false);
    // Note: actuallyDragged stays true if it was set during the drag

    console.log("States after reset:", {
      isDragging: false,
      actuallyDragged,
    });
  }, [isDragging, actuallyDragged]);

  // Toggle adding points mode
  const toggleAddingPoints = useCallback(() => {
    setIsAddingPoints((prev) => !prev);
    setIsAddingCurves(false); // Deactivate curve mode when activating point mode
    setIsDeletingLines(false); // Deactivate delete mode when activating point mode
  }, []);

  // Toggle adding curves mode
  const toggleAddingCurves = useCallback(() => {
    setIsAddingCurves((prev) => !prev);
    setIsAddingPoints(false); // Deactivate point mode when activating curve mode
    setIsDeletingLines(false); // Deactivate delete mode when activating curve mode
  }, []);

  // Remove a point and its associated lines
  const removePoint = useCallback((pointId: string) => {
    setChartData((prev) => ({
      points: prev.points.filter((point) => point.id !== pointId),
      lines: prev.lines.filter(
        (line) =>
          line.startPointId !== pointId &&
          line.endPointId !== pointId &&
          line.controlPointIds.every((cpId) => cpId !== pointId),
      ),
    }));
  }, []);

  // Remove a specific line and its associated points
  const removeLine = useCallback((lineId: string) => {
    setChartData((prev) => {
      const lineToRemove = prev.lines.find((l) => l.id === lineId);
      if (!lineToRemove) return prev;

      // Remove the line
      const updatedLines = prev.lines.filter((l) => l.id !== lineId);

      // Remove all points that belong to this line:
      // 1. Start point
      // 2. End point
      // 3. Control points
      const pointsToRemove = [
        lineToRemove.startPointId,
        lineToRemove.endPointId,
        ...lineToRemove.controlPointIds,
      ];

      const updatedPoints = prev.points.filter(
        (p) => !pointsToRemove.includes(p.id),
      );

      return {
        points: updatedPoints,
        lines: updatedLines,
      };
    });
  }, []);

  // Clear all data
  const clearChart = useCallback(() => {
    setChartData({
      points: [],
      lines: [],
    });
  }, []);

  // Restart animations
  const restartAnimations = useCallback(() => {
    // Force re-render by temporarily clearing and restoring data
    const currentData = chartData;
    setChartData({
      points: [],
      lines: [],
    });

    // Restore data after a brief moment to trigger animations
    setTimeout(() => {
      setChartData(currentData);
    }, 100);
  }, [chartData]);

  // Change specific line color and its points
  const changeLineColor = useCallback((lineId: string, color: string) => {
    setChartData((prev) => {
      const targetLine = prev.lines.find((line) => line.id === lineId);
      if (!targetLine) return prev;

      // Update line color
      const updatedLines = prev.lines.map((line) =>
        line.id === lineId ? { ...line, color } : line,
      );

      // Update points that belong to this line (start and end points)
      const updatedPoints = prev.points.map((point) => {
        if (
          point.id === targetLine.startPointId ||
          point.id === targetLine.endPointId
        ) {
          return { ...point, color };
        }
        return point;
      });

      return {
        ...prev,
        lines: updatedLines,
        points: updatedPoints,
      };
    });
  }, []);

  // Start new line mode
  const startNewLine = useCallback(() => {
    setIsNewLineMode(true);
  }, []);

  // Set hovered line
  const setHoveredLine = useCallback((lineId: string | null) => {
    setHoveredLineId(lineId);
  }, []);

  // Toggle delete mode
  const toggleDeletingLines = useCallback(() => {
    setIsDeletingLines((prev) => !prev);
    setIsAddingPoints(false);
    setIsAddingCurves(false);
  }, []);

  // Update cursor position
  const updateCursorPosition = useCallback((x: number, y: number) => {
    setCursorPosition({ x, y });
  }, []);

  // Open point style menu
  const openPointStyleMenu = useCallback(
    (pointId: string, x: number, y: number) => {
      console.log("🎯 openPointStyleMenu called with:", { pointId, x, y });
      setPointStyleMenu({ pointId, x, y });
      console.log("📋 Point style menu state updated");
    },
    [],
  );

  // Close point style menu
  const closePointStyleMenu = useCallback(() => {
    setPointStyleMenu(null);
    setActuallyDragged(false); // Reset drag state when menu closes
  }, []);

  // Reset drag state (for external use)
  const resetDragState = useCallback(() => {
    setActuallyDragged(false);
  }, []);

  // Update point style
  const updatePointStyle = useCallback((pointId: string, style: PointStyle) => {
    setChartData((prev) => ({
      ...prev,
      points: prev.points.map((point) =>
        point.id === pointId ? { ...point, style } : point,
      ),
    }));
    closePointStyleMenu();
    setActuallyDragged(false); // Reset drag state after menu interaction
  }, []);

  // Check if should open menu (simple logic)
  const shouldOpenMenu = useCallback(() => {
    console.log("shouldOpenMenu check:", {
      isDragging,
      actuallyDragged,
      dragMoveCount,
    });

    // Simple rule: only open if NOT currently dragging and was NOT actually dragged
    const canOpen = !isDragging && !actuallyDragged;

    if (canOpen) {
      console.log("ALLOWED: opening menu");
    } else {
      console.log(
        "BLOCKED: isDragging =",
        isDragging,
        "actuallyDragged =",
        actuallyDragged,
        "dragMoveCount =",
        dragMoveCount,
      );
    }

    return canOpen;
  }, [isDragging, actuallyDragged, dragMoveCount]);

  return {
    chartData,
    isAddingPoints,
    isAddingCurves,
    isDeletingLines,
    draggedPointId,
    isDragging,
    currentColor,
    hoveredLineId,
    cursorPosition,
    pointStyleMenu,
    addPoint,
    addPointByClick,
    addControlPointToLine,
    updatePointPosition,
    startDragging,
    stopDragging,
    shouldOpenMenu,
    resetDragState,
    toggleAddingPoints,
    toggleAddingCurves,
    toggleDeletingLines,
    removePoint,
    removeLine,
    clearChart,
    restartAnimations,
    changeLineColor,
    startNewLine,
    setHoveredLine,
    updateCursorPosition,
    openPointStyleMenu,
    closePointStyleMenu,
    updatePointStyle,
  };
};
