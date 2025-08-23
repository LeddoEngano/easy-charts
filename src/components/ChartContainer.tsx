"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useChart } from "@/hooks/useChart";
import type { Line, Point } from "@/types/chart";
import { Chart } from "./Chart";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { CodeDrawer } from "./CodeDrawer";

export const ChartContainer = () => {
  const {
    chartData,
    isAddingPoints,
    isAddingCurves,
    draggedPointId,
    addPointByClick,
    addControlPointToLine,
    updatePointPosition,
    startDragging,
    stopDragging,
    toggleAddingPoints,
    toggleAddingCurves,
    clearChart,
    restartAnimations,
  } = useChart();

  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);

  const handlePointClick = (point: Point) => {
    // For now, just log the point. In the future, this could open a modal to edit the point
    console.log("Point clicked:", point);
  };

  const handleChartClick = (x: number, y: number) => {
    if (isAddingPoints) {
      addPointByClick(x, y);
    }
  };

  const handleLineClick = (line: Line, x: number, y: number) => {
    if (isAddingCurves) {
      addControlPointToLine(line.id, x, y);
    }
  };

  const handlePointDrag = (pointId: string, x: number, y: number) => {
    updatePointPosition(pointId, x, y);
  };

  const handlePointDragStart = (pointId: string) => {
    startDragging(pointId);
  };

  const handlePointDragEnd = () => {
    stopDragging();
  };

  const handleOpenCodeDrawer = () => {
    setIsCodeDrawerOpen(true);
  };

  const handleCloseCodeDrawer = () => {
    setIsCodeDrawerOpen(false);
  };

  // Calculate curves count
  const curvesCount = chartData.lines.reduce(
    (total, line) => total + line.controlPointIds.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar
          onToggleAddingPoints={toggleAddingPoints}
          onToggleAddingCurves={toggleAddingCurves}
          onClearChart={clearChart}
          onRestartAnimations={restartAnimations}
          isAddingPoints={isAddingPoints}
          isAddingCurves={isAddingCurves}
          pointsCount={chartData.points.length}
          linesCount={chartData.lines.length}
          curvesCount={curvesCount}
        />

        <div className="flex-1 flex items-center justify-center p-8">
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
              draggedPointId={draggedPointId}
              onOpenCodeDrawer={handleOpenCodeDrawer}
              width={800}
              height={600}
            />
          </motion.div>
        </div>
      </div>

      {/* Code Drawer */}
      <CodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={handleCloseCodeDrawer}
        chartData={chartData}
      />
    </div>
  );
};
