import { useCallback, useState, useEffect, useRef } from "react";
import type { ChartData, Line, Point, PointStyle, Text } from "@/types/chart";
import type { AxesMode } from "@/components/Toolbar";

const STORAGE_KEY = "easy-charts-data";

// Predefined colors for automatic color cycling
const LINE_COLORS = [
  "#9edc53", // Green
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#06b6d4", // Teal
  "#a855f7", // Violet
  "#f43f5e", // Rose
];

export const useChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    points: [],
    lines: [],
    texts: [],
  });

  const [isAddingPoints, setIsAddingPoints] = useState(true);
  const [isAddingCurves, setIsAddingCurves] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [draggedTextId, setDraggedTextId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#3b82f6"); // Default blue
  const [isNewLineMode, setIsNewLineMode] = useState(false);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [isDeletingLines, setIsDeletingLines] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [controlPointPreview, setControlPointPreview] = useState<{
    lineId: string;
    x: number;
    y: number;
  } | null>(null);
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
  const [axesMode, setAxesMode] = useState<AxesMode>("off");
  const [showGrid, setShowGrid] = useState(true);

  // Undo/Redo system
  const [history, setHistory] = useState<ChartData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldSaveHistory, setShouldSaveHistory] = useState(false);
  const [hasInitialSave, setHasInitialSave] = useState(false);
  const historyIndexRef = useRef(historyIndex);
  const isUndoRedoActionRef = useRef(false);

  // Load data from localStorage only on client side
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Ensure backwards compatibility - add texts array if it doesn't exist
        const chartData: ChartData = {
          points: parsedData.points || [],
          lines: parsedData.lines || [],
          texts: parsedData.texts || [],
        };
        setChartData(chartData);

        // Initialize history with the loaded data
        setHistory([chartData]);
        setHistoryIndex(0);
        historyIndexRef.current = 0;
        setIsInitialized(true);
        // Enable history saving after a short delay to avoid saving initial state
        setTimeout(() => setShouldSaveHistory(true), 100);
      } catch (error) {
        console.warn("Failed to parse saved chart data:", error);
        // Initialize with empty state if loading fails
        const emptyState: ChartData = { points: [], lines: [], texts: [] };
        setHistory([emptyState]);
        setHistoryIndex(0);
        historyIndexRef.current = 0;
        setIsInitialized(true);
        // Enable history saving after a short delay to avoid saving initial state
        setTimeout(() => setShouldSaveHistory(true), 100);
      }
    } else {
      // Initialize with empty state if no saved data
      const emptyState: ChartData = { points: [], lines: [], texts: [] };
      setHistory([emptyState]);
      setHistoryIndex(0);
      historyIndexRef.current = 0;
      setIsInitialized(true);
      // Enable history saving after a short delay to avoid saving initial state
      setTimeout(() => setShouldSaveHistory(true), 100);
    }
  }, []);

  // Save chart data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chartData));
  }, [chartData]);

  // Save current state to history
  const saveToHistory = useCallback((data: ChartData) => {
    setHistory((prevHistory) => {
      // Create new history array - always add to the end
      const newHistory = [...prevHistory];

      // Add new state
      newHistory.push(JSON.parse(JSON.stringify(data))); // Deep clone
      // Limit history size to prevent memory issues
      const maxHistorySize = 100;
      if (newHistory.length > maxHistorySize) {
        // Remove oldest entries but keep at least 10
        const toRemove = newHistory.length - maxHistorySize;
        newHistory.splice(0, toRemove);
      }

      return newHistory;
    });
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      historyIndexRef.current = newIndex;
      return newIndex;
    });
  }, []);

  // Update refs when states change
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    isUndoRedoActionRef.current = isUndoRedoAction;
  }, [isUndoRedoAction]);

  // Initialize history with current state
  useEffect(() => {
    if (isInitialized && shouldSaveHistory && !hasInitialSave) {
      setHistory([JSON.parse(JSON.stringify(chartData))]);
      setHistoryIndex(0);
      historyIndexRef.current = 0;
      setHasInitialSave(true);
    }
  }, [isInitialized, shouldSaveHistory, hasInitialSave]); // Removed chartData to prevent infinite loop

  // Save to history when chart data changes (but not during undo/redo)
  useEffect(() => {

    // Check if this is an undo/redo action - use a more robust approach
    if (isUndoRedoActionRef.current) {
      // Only reset the ref here, don't reset the state yet to avoid timing issues
      isUndoRedoActionRef.current = false;
      return;
    }

    // Don't save if history hasn't been initialized yet
    if (!hasInitialSave) {
      return;
    }

    // Save user actions directly without calling saveUserAction to avoid dependency loop
    if (historyIndex === history.length - 1) {
      // At the end of history - add normally
      saveToHistory(chartData);
    } else {
      // In the middle of history - create new branch
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(chartData)));
        return newHistory;
      });
      setHistoryIndex((prev) => {
        const newIndex = prev + 1;
        historyIndexRef.current = newIndex;
        return newIndex;
      });
    }
  }, [chartData, hasInitialSave]); // Only depend on chartData and hasInitialSave

  // Get next color for new lines based on current line count
  const getNextColor = useCallback((currentLineCount: number) => {
    const colorIndex = currentLineCount % LINE_COLORS.length;
    return LINE_COLORS[colorIndex];
  }, []);

  // Add a new point to the chart
  const addPoint = useCallback(
    (x: number, y: number, label?: string) => {
      setChartData((prev) => {
        // Determine the color for the new point
        let pointColor: string;

        // Simplified logic: if we have an odd number of points, it's starting a new line
        const isStartingNewLine = prev.points.length % 2 === 0;

        if (isStartingNewLine) {
          // This point will start a new line, so use the next color
          pointColor = getNextColor(Math.floor(prev.points.length / 2));
        } else {
          // This is the second point of a line, use the same color as the previous point
          pointColor = prev.points[prev.points.length - 1].color;
        }

        const newPoint: Point = {
          id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x,
          y,
          label,
          color: pointColor,
          style: "default", // Default style for new points
        };

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
            // Use the same color that was determined for the points
            const lineColor = pointColor;

            const newLine: Line = {
              id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              startPointId: secondLastPoint.id,
              endPointId: lastPoint.id,
              startPoint: secondLastPoint,
              endPoint: lastPoint,
              controlPointIds: [],
              color: lineColor,
            };

            // Update the color of both points to match the line
            newPoints[newPoints.length - 1] = {
              ...lastPoint,
              color: lineColor,
            };
            newPoints[newPoints.length - 2] = {
              ...secondLastPoint,
              color: lineColor,
            };

            newLines.push(newLine);
          }
        }

        return {
          ...prev,
          points: newPoints,
          lines: newLines,
        };
      });
    },
    [isNewLineMode, currentColor, getNextColor],
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

  // Add text to the chart
  const addText = useCallback((x: number, y: number, content: string) => {
    setChartData((prev) => {
      const newText: Text = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        content,
        color: "#000000",
        fontSize: 14,
        fontFamily: "Arial",
      };

      const updatedData = {
        ...prev,
        texts: [...(prev.texts || []), newText],
      };

      return updatedData;
    });
  }, []);

  // Update text position (for dragging)
  const updateTextPosition = useCallback(
    (textId: string, x: number, y: number) => {
      setChartData((prev) => ({
        ...prev,
        texts: prev.texts.map((text) =>
          text.id === textId ? { ...text, x, y } : text,
        ),
      }));
    },
    [],
  );

  // Update text content
  const updateTextContent = useCallback((textId: string, content: string) => {
    setChartData((prev) => ({
      ...prev,
      texts: prev.texts.map((text) =>
        text.id === textId ? { ...text, content } : text,
      ),
    }));
  }, []);

  // Update text properties
  const updateText = useCallback((textId: string, updates: Partial<Text>) => {
    setChartData((prev) => ({
      ...prev,
      texts: prev.texts.map((text) =>
        text.id === textId ? { ...text, ...updates } : text,
      ),
    }));
  }, []);

  // Remove text
  const removeText = useCallback((textId: string) => {
    setChartData((prev) => ({
      ...prev,
      texts: prev.texts.filter((text) => text.id !== textId),
    }));
  }, []);

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
        ...prev,
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
    },
    [isAddingCurves, chartData.points],
  );

  // Update point position (for dragging)
  const updatePointPosition = useCallback(
    (pointId: string, x: number, y: number) => {

      setDragMoveCount((prev) => {
        const newCount = prev + 1;

        if (newCount > 2) {
          setActuallyDragged(true);
        }

        return newCount;
      });

      if (dragStartPosition) {
        const distance = Math.sqrt(
          Math.pow(x - dragStartPosition.x, 2) +
          Math.pow(y - dragStartPosition.y, 2),
        );

        if (distance > 8) {
          setActuallyDragged(true);
        }
      }

      setChartData((prev) => {
        const updatedPoints = prev.points.map((point) =>
          point.id === pointId ? { ...point, x, y } : point,
        );

        const updatedPoint = updatedPoints.find((p) => p.id === pointId);

        return {
          ...prev,
          points: updatedPoints,
          lines: prev.lines.map((line) => {
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
      setDraggedPointId(pointId);
      setDragStartPosition({ x: startX, y: startY });
      setIsDragging(true);
      setActuallyDragged(false);
      setDragMoveCount(0);
    },
    [],
  );

  // Stop dragging
  const stopDragging = useCallback(() => {
    setDraggedPointId(null);
    setDragStartPosition(null);
    setIsDragging(false);
    // Reset actuallyDragged after a short delay to allow menu logic to work
    setTimeout(() => {
      setActuallyDragged(false);
    }, 100);
  }, []);

  // Toggle adding points mode
  const toggleAddingPoints = useCallback(() => {
    setIsAddingPoints((prev) => !prev);
    setIsAddingCurves(false); // Deactivate curve mode when activating point mode
    setIsAddingText(false); // Deactivate text mode when activating point mode
    setIsDeletingLines(false); // Deactivate delete mode when activating point mode
  }, []);

  // Toggle adding curves mode
  const toggleAddingCurves = useCallback(() => {
    setIsAddingCurves((prev) => !prev);
    setIsAddingPoints(false); // Deactivate point mode when activating curve mode
    setIsAddingText(false); // Deactivate text mode when activating curve mode
    setIsDeletingLines(false); // Deactivate delete mode when activating curve mode

    // Clear control point preview when deactivating curve mode
    if (isAddingCurves) {
      setControlPointPreview(null);
    }
  }, [isAddingCurves]);

  // Toggle adding text mode
  const toggleAddingText = useCallback(() => {
    setIsAddingText((prev) => !prev);
    setIsAddingPoints(false); // Deactivate point mode when activating text mode
    setIsAddingCurves(false); // Deactivate curve mode when activating text mode
    setIsDeletingLines(false); // Deactivate delete mode when activating text mode
  }, []);

  // Remove a point and its associated lines
  const removePoint = useCallback((pointId: string) => {
    setChartData((prev) => {
      // Check if this is a control point
      const isControlPoint = pointId.startsWith("control-");

      if (isControlPoint) {
        // If it's a control point, only remove the point and update lines to remove it from controlPointIds
        return {
          ...prev,
          points: prev.points.filter((point) => point.id !== pointId),
          lines: prev.lines.map((line) => ({
            ...line,
            controlPointIds: line.controlPointIds.filter((cpId) => cpId !== pointId),
          })),
        };
      } else {
        // If it's a regular point (start or end point), remove the point and its associated lines
        return {
          ...prev,
          points: prev.points.filter((point) => point.id !== pointId),
          lines: prev.lines.filter(
            (line) =>
              line.startPointId !== pointId &&
              line.endPointId !== pointId &&
              line.controlPointIds.every((cpId) => cpId !== pointId),
          ),
        };
      }
    });
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
        ...prev,
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
      texts: [],
    });
    // Clear from localStorage
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Save current chart data manually
  const saveChartData = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chartData));
  }, [chartData]);

  // Load chart data from localStorage
  const loadChartData = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setChartData(parsedData);
      } catch (error) {
        console.warn("Failed to parse saved chart data:", error);
      }
    }
  }, []);

  // Restart animations
  const restartAnimations = useCallback(() => {
    // Force re-render by temporarily clearing and restoring data
    const currentData = chartData;
    setChartData({
      points: [],
      lines: [],
      texts: [],
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

  // Update control point preview
  const updateControlPointPreview = useCallback((lineId: string | null, x?: number, y?: number) => {
    if (lineId && x !== undefined && y !== undefined) {
      setControlPointPreview({ lineId, x, y });
    } else {
      setControlPointPreview(null);
    }
  }, []);

  // Toggle delete mode
  const toggleDeletingLines = useCallback(() => {
    setIsDeletingLines((prev) => !prev);
    setIsAddingPoints(false);
    setIsAddingCurves(false);
    setIsAddingText(false);
  }, []);

  // Update cursor position
  const updateCursorPosition = useCallback((x: number, y: number) => {
    setCursorPosition({ x, y });
  }, []);

  // Open point style menu
  const openPointStyleMenu = useCallback(
    (pointId: string, x: number, y: number) => {
      setPointStyleMenu({ pointId, x, y });
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

  // Update point label
  const updatePointLabel = useCallback((pointId: string, label?: string) => {
    setChartData((prev) => ({
      ...prev,
      points: prev.points.map((point) =>
        point.id === pointId ? { ...point, label } : point,
      ),
    }));
  }, []);

  // Preview point style temporarily
  const previewPointStyle = useCallback((pointId: string, style: PointStyle) => {
    setChartData((prev) => ({
      ...prev,
      points: prev.points.map((point) =>
        point.id === pointId ? { ...point, style } : point,
      ),
    }));
  }, []);

  // Check if should open menu (simple logic)
  const shouldOpenMenu = useCallback(() => {
    const canOpen = !isDragging && !actuallyDragged;
    return canOpen;
  }, [isDragging, actuallyDragged]);

  // Set axes mode
  const setAxesModeHandler = useCallback((mode: AxesMode) => {
    setAxesMode(mode);
  }, []);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];

      if (previousState) {

        // Set undo/redo flag BEFORE any state changes
        isUndoRedoActionRef.current = true;
        setIsUndoRedoAction(true);

        // Update history index and chart data in sequence
        setHistoryIndex(newIndex);
        setChartData(JSON.parse(JSON.stringify(previousState)));
      } else {
        console.log('Undo failed - previousState is null/undefined');
      }
    } else {
      console.log('Undo blocked - no previous state available');
    }
  }, [historyIndex, history]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];

      if (nextState) {
        // Set undo/redo flag BEFORE any state changes
        isUndoRedoActionRef.current = true;
        setIsUndoRedoAction(true);

        // Update history index and chart data in sequence
        setHistoryIndex(newIndex);
        setChartData(JSON.parse(JSON.stringify(nextState)));
      } else {
        console.log('Redo failed - nextState is null/undefined');
      }
    } else {
      console.log('Redo blocked - no next state available');
    }
  }, [historyIndex, history]);

  // Check if undo/redo are available
  const canUndo = history.length > 2; // Need at least 2 states to undo (initial + 1 action)
  const canRedo = historyIndex < history.length - 1;

  return {
    chartData,
    isAddingPoints,
    isAddingCurves,
    isAddingText,
    isDeletingLines,
    draggedPointId,
    draggedTextId,
    setDraggedTextId,
    isDragging,
    currentColor,
    hoveredLineId,
    cursorPosition,
    pointStyleMenu,
    controlPointPreview,
    axesMode,
    showGrid,
    addPoint,
    addPointByClick,
    addText,
    updateTextPosition,
    updateTextContent,
    updateText,
    removeText,
    addControlPointToLine,
    updatePointPosition,
    startDragging,
    stopDragging,
    shouldOpenMenu,
    resetDragState,
    toggleAddingPoints,
    toggleAddingCurves,
    toggleAddingText,
    toggleDeletingLines,
    removePoint,
    removeLine,
    clearChart,
    restartAnimations,
    changeLineColor,
    startNewLine,
    setHoveredLine,
    updateControlPointPreview,
    updateCursorPosition,
    openPointStyleMenu,
    closePointStyleMenu,
    updatePointStyle,
    updatePointLabel,
    previewPointStyle,
    saveChartData,
    loadChartData,
    setAxesModeHandler,
    toggleGrid,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
