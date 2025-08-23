import { useCallback, useState } from "react";
import type { ChartData, Line, Point } from "@/types/chart";

export const useChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    points: [],
    lines: [],
  });

  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [isAddingCurves, setIsAddingCurves] = useState(false);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);

  // Add a new point to the chart
  const addPoint = useCallback((x: number, y: number, label?: string) => {
    const newPoint: Point = {
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      label,
    };

    setChartData((prev) => {
      const newPoints = [...prev.points, newPoint];

      // If we have 2 or more points, create a line between the last two points
      const newLines = [...prev.lines];
      if (newPoints.length >= 2) {
        const lastPoint = newPoints[newPoints.length - 1];
        const secondLastPoint = newPoints[newPoints.length - 2];

        const newLine: Line = {
          id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startPointId: secondLastPoint.id,
          endPointId: lastPoint.id,
          startPoint: secondLastPoint,
          endPoint: lastPoint,
          controlPointIds: [],
        };

        newLines.push(newLine);
      }

      return {
        points: newPoints,
        lines: newLines,
      };
    });
  }, []);

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
    [],
  );

  // Start dragging a point
  const startDragging = useCallback((pointId: string) => {
    setDraggedPointId(pointId);
  }, []);

  // Stop dragging
  const stopDragging = useCallback(() => {
    setDraggedPointId(null);
  }, []);

  // Toggle adding points mode
  const toggleAddingPoints = useCallback(() => {
    setIsAddingPoints((prev) => !prev);
    setIsAddingCurves(false); // Deactivate curve mode when activating point mode
  }, []);

  // Toggle adding curves mode
  const toggleAddingCurves = useCallback(() => {
    setIsAddingCurves((prev) => !prev);
    setIsAddingPoints(false); // Deactivate point mode when activating curve mode
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

  return {
    chartData,
    isAddingPoints,
    isAddingCurves,
    draggedPointId,
    addPoint,
    addPointByClick,
    addControlPointToLine,
    updatePointPosition,
    startDragging,
    stopDragging,
    toggleAddingPoints,
    toggleAddingCurves,
    removePoint,
    clearChart,
    restartAnimations,
  };
};
