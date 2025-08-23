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
    showGrid,
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
    toggleGrid,
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

  const handleDownloadChart = (format: "svg" | "png" | "gif") => {
    const chartContainer = document.querySelector(
      ".chart-container",
    ) as HTMLElement;
    if (!chartContainer) {
      console.error("Chart container not found!");
      return;
    }

    // Create a combined SVG from all chart elements
    const combinedSVG = createCombinedSVG(chartContainer);

    switch (format) {
      case "svg":
        downloadSVG(combinedSVG);
        break;
      case "png":
        downloadPNG(combinedSVG);
        break;
      case "gif":
        // TODO: Implement GIF download
        alert("Download de GIF será implementado em breve!");
        break;
    }
  };

  const createCombinedSVG = (container: HTMLElement): SVGElement => {
    // Create a new SVG element that will contain everything
    const combinedSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    combinedSVG.setAttribute("width", "800");
    combinedSVG.setAttribute("height", "600");
    combinedSVG.setAttribute("viewBox", "0 0 800 600");
    combinedSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Set white background
    const background = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "white");
    combinedSVG.appendChild(background);

    // Find and combine all SVG elements in the correct order
    const svgElements = container.querySelectorAll("svg");

    svgElements.forEach((svg) => {
      const ariaLabel = svg.getAttribute("aria-label");

      // Skip if this is a button or interface element
      if (svg.closest("button") || svg.closest(".download-menu-container")) {
        return;
      }

      // Skip grid if it's disabled
      if (ariaLabel === "Grid background" && !showGrid) {
        return;
      }

      // Skip axes if they're disabled
      if (ariaLabel === "Chart axes" && axesMode === "off") {
        return;
      }

      // Clone the SVG content
      const svgClone = svg.cloneNode(true) as SVGElement;

      // Extract all children from the cloned SVG and add to combined SVG
      while (svgClone.firstChild) {
        const child = svgClone.firstChild;
        combinedSVG.appendChild(child);
      }
    });

    // Clean up the combined SVG
    return createCleanSVG(combinedSVG);
  };

  const createCleanSVG = (originalSVG: SVGElement): SVGElement => {
    // Clone the original SVG
    const cleanSVG = originalSVG.cloneNode(true) as SVGElement;

    // Remove tooltip elements (elements with title or aria-label containing "tooltip")
    const tooltipElements = cleanSVG.querySelectorAll(
      '[title*="tooltip"], [aria-label*="tooltip"]',
    );
    tooltipElements.forEach((el) => el.remove());

    // Remove any elements with class containing "tooltip"
    const tooltipClassElements =
      cleanSVG.querySelectorAll('[class*="tooltip"]');
    tooltipClassElements.forEach((el) => el.remove());

    // Remove any text elements that might be tooltips (usually small text)
    const textElements = cleanSVG.querySelectorAll("text");
    textElements.forEach((text) => {
      const textContent = text.textContent?.toLowerCase() || "";
      if (
        textContent.includes("tooltip") ||
        textContent.includes("dica") ||
        textContent.includes("clique")
      ) {
        text.remove();
      }
    });

    // Grid and axes are now handled in createCombinedSVG
    // This function now focuses on cleaning up interactive elements

    // Remove control points (they should not appear in final output)
    const controlPointGroups = cleanSVG.querySelectorAll('g[key*="control-"]');
    controlPointGroups.forEach((el) => el.remove());

    // Also remove any circles that might be control points based on position/size
    const allGroups = cleanSVG.querySelectorAll("g");
    allGroups.forEach((group) => {
      const key = group.getAttribute("key");
      if (key && key.includes("control-")) {
        group.remove();
      }
    });

    // Remove any interactive elements that shouldn't be in the download
    const interactiveElements = cleanSVG.querySelectorAll(
      "[onclick], [onkeydown], [tabindex]",
    );
    interactiveElements.forEach((el) => {
      el.removeAttribute("onclick");
      el.removeAttribute("onkeydown");
      el.removeAttribute("tabindex");
    });

    // Remove any elements with pointer-events (interactive areas)
    const pointerElements = cleanSVG.querySelectorAll(
      '[style*="pointer-events"]',
    );
    pointerElements.forEach((el) => {
      const style = el.getAttribute("style");
      if (style) {
        el.setAttribute(
          "style",
          style.replace(/pointer-events:\s*[^;]+;?/g, ""),
        );
      }
    });

    // Remove any invisible clickable areas (lines with transparent stroke)
    const invisibleLines = cleanSVG.querySelectorAll(
      'line[stroke="transparent"], line[stroke="rgba(0,0,0,0)"]',
    );
    invisibleLines.forEach((el) => el.remove());

    // Clean up any empty style attributes
    const elementsWithStyle = cleanSVG.querySelectorAll("[style]");
    elementsWithStyle.forEach((el) => {
      const style = el.getAttribute("style");
      if (style && style.trim() === "") {
        el.removeAttribute("style");
      }
    });

    return cleanSVG;
  };

  const downloadSVG = (svgElement: SVGElement) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `chart-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const downloadPNG = (svgElement: SVGElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `chart-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pngUrl);
      }, "image/png");

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
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
          <Toolbar
            axesMode={axesMode}
            onAxesModeChange={setAxesModeHandler}
            showGrid={showGrid}
            onToggleGrid={toggleGrid}
            onOpenCodeDrawer={handleOpenCodeDrawer}
          />

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
                onRestartAnimations={restartAnimations}
                onDownloadChart={handleDownloadChart}
                axesMode={axesMode}
                showGrid={showGrid}
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
        showGrid={showGrid}
        axesMode={axesMode}
      />
    </div>
  );
};
