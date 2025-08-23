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
  } = useChart();

  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [isPointClicked, setIsPointClicked] = useState(false);
  const [lastClickedPoint, setLastClickedPoint] = useState<{
    point: Point;
    event: React.MouseEvent;
  } | null>(null);

  // Log quando pointStyleMenu muda
  useEffect(() => {
    console.log("🔄 pointStyleMenu changed:", pointStyleMenu);
  }, [pointStyleMenu]);

  // Effect para detectar quando o arrasto termina e abrir o menu
  useEffect(() => {
    if (!isDragging && lastClickedPoint) {
      console.log("🎯 Drag ended, checking if should open menu for:", lastClickedPoint.point.id);

      // Verificar se o ponto foi realmente movido
      const canOpen = shouldOpenMenu();
      console.log("✅ shouldOpenMenu result:", canOpen);

      if (canOpen) {
        console.log("🎉 Opening menu for point:", lastClickedPoint.point.id);
        openPointStyleMenu(
          lastClickedPoint.point.id,
          lastClickedPoint.event.clientX,
          lastClickedPoint.event.clientY,
        );
      } else {
        console.log("🚫 Menu blocked - point was dragged");
      }

      setLastClickedPoint(null);
    }
  }, [isDragging, lastClickedPoint, shouldOpenMenu, openPointStyleMenu]);

  // Log do estado do menu a cada render
  console.log("🔍 Current pointStyleMenu state:", pointStyleMenu);

  const handlePointClick = (point: Point, event: React.MouseEvent) => {
    console.log("🔴 === handlePointClick called for point:", point.id, "===");
    console.log("🔍 Current pointStyleMenu state before click:", pointStyleMenu);
    setIsPointClicked(true);

    if (isDeletingLines) {
      console.log("🗑️ Deleting point:", point.id);
      removePoint(point.id);
      return;
    }

    // TESTE: Forçar abertura do menu para o primeiro ponto
    if (point.id === chartData.points[0]?.id) {
      console.log("🧪 TESTE: Forçando abertura do menu para o primeiro ponto");
      console.log("🎯 Calling openPointStyleMenu with:", {
        pointId: point.id,
        x: event.clientX,
        y: event.clientY,
      });
      openPointStyleMenu(point.id, event.clientX, event.clientY);
      console.log("🔍 pointStyleMenu state after openPointStyleMenu:", pointStyleMenu);
      setTimeout(() => {
        console.log("🔍 pointStyleMenu state after timeout:", pointStyleMenu);
        setIsPointClicked(false);
      }, 50);
      return;
    }

    // Armazenar o ponto clicado para abrir o menu quando o arrasto terminar
    console.log("📝 Storing clicked point for later menu opening");
    setLastClickedPoint({ point, event });

    setTimeout(() => setIsPointClicked(false), 50);
  };

  const handleChartClick = (x: number, y: number) => {
    console.log("handleChartClick called, isPointClicked:", isPointClicked);

    // Don't add point if a point was just clicked
    if (isPointClicked) {
      console.log("Ignoring chart click - point was clicked");
      return;
    }

    if (isAddingPoints) {
      console.log("Adding point at:", x, y);
      addPointByClick(x, y);
    }
  };

  const handleLineClick = (line: Line, x: number, y: number) => {
    console.log("Line clicked:", line.id, "isDeletingLines:", isDeletingLines);
    if (isAddingCurves) {
      addControlPointToLine(line.id, x, y);
    } else if (isDeletingLines) {
      console.log("Removing line:", line.id);
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
    console.log("handlePointDragStart called for point:", pointId);
    setIsPointClicked(true); // Mark that a point interaction started
    startDragging(pointId, startX, startY);
  };

  const handlePointDragEnd = () => {
    console.log("handlePointDragEnd called");
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

      <div className="flex h-[calc(100vh-80px)]">
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

        <div
          className="flex-1 flex items-center justify-center p-8 relative"
          onMouseMove={handleMouseMove}
        >
          {/* Botão de teste para forçar abertura do menu */}
          <button
            onClick={() => {
              console.log("🧪 TESTE: Forçando abertura do menu via botão");
              if (chartData.points.length > 0) {
                const firstPoint = chartData.points[0];
                openPointStyleMenu(firstPoint.id, 400, 300);
              }
            }}
            className="absolute top-4 left-4 z-50 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            TESTE MENU
          </button>
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
              width={800}
              height={600}
            />
          </motion.div>

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
