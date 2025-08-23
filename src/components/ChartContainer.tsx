"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useChart } from "@/hooks/useChart";
import type { Line, Point } from "@/types/chart";
import { Chart } from "./Chart";
import { Header } from "./Header";
import { PointStyleMenu } from "./PointStyleMenu";
import { Sidebar } from "./Sidebar";
import { CodeDrawer } from "./CodeDrawer";
import { Toolbar, type AxesMode } from "./Toolbar";

export const ChartContainer = () => {
  const {
    chartData,
    isAddingPoints,
    isAddingCurves,
    isDeletingLines,
    draggedPointId,
    isDragging,
    hoveredLineId,
    cursorPosition,
    pointStyleMenu,
    axesMode,
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
    removeLine,
    removePoint,
    clearChart,
    restartAnimations,
    changeLineColor,
    startNewLine,
    setHoveredLine,
    updateCursorPosition,
    openPointStyleMenu,
    closePointStyleMenu,
    updatePointStyle,
    setAxesModeHandler,
  } = useChart();

  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [isPointClicked, setIsPointClicked] = useState(false);
  const [lastClickedPoint, setLastClickedPoint] = useState<{
    point: Point;
    event: React.MouseEvent;
  } | null>(null);

  // Effect para detectar quando o arrasto termina e abrir o menu
  useEffect(() => {
    if (!isDragging && lastClickedPoint) {
      const canOpen = shouldOpenMenu();

      if (canOpen) {
        openPointStyleMenu(
          lastClickedPoint.point.id,
          lastClickedPoint.event.clientX,
          lastClickedPoint.event.clientY,
        );
      }

      setLastClickedPoint(null);
    }
  }, [isDragging, lastClickedPoint, shouldOpenMenu, openPointStyleMenu]);

  const handlePointClick = (point: Point, event: React.MouseEvent) => {
    setIsPointClicked(true);

    if (isDeletingLines) {
      removePoint(point.id);
      return;
    }

    setLastClickedPoint({ point, event });
    setTimeout(() => setIsPointClicked(false), 50);
  };

  const handleChartClick = (x: number, y: number) => {
    if (isPointClicked) {
      return;
    }

    if (isAddingPoints) {
      addPointByClick(x, y);
    }
  };

  const handleLineClick = (line: Line, x: number, y: number) => {
    if (isAddingCurves) {
      addControlPointToLine(line.id, x, y);
    } else if (isDeletingLines) {
      removeLine(line.id);
    }
  };

  const handlePointDrag = (pointId: string, x: number, y: number) => {
    updatePointPosition(pointId, x, y);
  };

  const handlePointDragStart = (
    pointId: string,
    startX: number,
    startY: number,
  ) => {
    setIsPointClicked(true);
    startDragging(pointId, startX, startY);
  };

  const handlePointDragEnd = () => {
    stopDragging();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDeletingLines) {
      updateCursorPosition(e.clientX, e.clientY);
    }
  };

  const handleOpenCodeDrawer = () => {
    setIsCodeDrawerOpen(true);
  };

  const handleCloseCodeDrawer = () => {
    setIsCodeDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          onToggleAddingPoints={toggleAddingPoints}
          onToggleAddingCurves={toggleAddingCurves}
          onToggleDeletingLines={toggleDeletingLines}
          onClearChart={clearChart}
          onLineColorChange={changeLineColor}
          onStartNewLine={startNewLine}
          onLineHover={setHoveredLine}
          isAddingPoints={isAddingPoints}
          isAddingCurves={isAddingCurves}
          isDeletingLines={isDeletingLines}
          lines={chartData.lines.map((line) => ({
            id: line.id,
            color: line.color,
          }))}
        />

        <div className="flex-1 flex flex-col">
          <Toolbar axesMode={axesMode} onAxesModeChange={setAxesModeHandler} />

          <div
            className="flex-1 flex items-center justify-center p-8 relative"
            onMouseMove={handleMouseMove}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Chart
                points={chartData.points}
                lines={chartData.lines}
                onPointClick={handlePointClick}
                onLineClick={handleLineClick}
                onChartClick={handleChartClick}
                onPointDrag={handlePointDrag}
                onPointDragStart={handlePointDragStart}
                onPointDragEnd={handlePointDragEnd}
                isAddingPoints={isAddingPoints}
                isAddingCurves={isAddingCurves}
                isDeletingLines={isDeletingLines}
                draggedPointId={draggedPointId}
                hoveredLineId={hoveredLineId}
                cursorPosition={cursorPosition}
                onOpenCodeDrawer={handleOpenCodeDrawer}
                onRestartAnimations={restartAnimations}
                axesMode={axesMode}
                width={800}
                height={600}
              />
            </motion.div>
          </div>

          {/* Trash icon that follows cursor when in delete mode */}
          {isDeletingLines && (
            <motion.div
              className="fixed pointer-events-none z-50"
              style={{
                left: cursorPosition.x + 10,
                top: cursorPosition.y - 30,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-red-500 text-white p-1 rounded shadow-lg">
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
                  aria-label="Excluir linha"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Point Style Menu */}
      {pointStyleMenu && (
        <PointStyleMenu
          isOpen={true}
          x={pointStyleMenu.x}
          y={pointStyleMenu.y}
          currentStyle={
            chartData.points.find((p) => p.id === pointStyleMenu.pointId)
              ?.style || "default"
          }
          onStyleChange={(style) =>
            updatePointStyle(pointStyleMenu.pointId, style)
          }
          onClose={closePointStyleMenu}
        />
      )}

      {/* Code Drawer */}
      <CodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={handleCloseCodeDrawer}
        chartData={chartData}
      />
    </div>
  );
};
