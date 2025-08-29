"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useChart } from "@/hooks/useChart";
import {
  useCanvasInteraction,
  type CanvasItem,
  type InteractionEvent,
} from "@/hooks/useCanvasInteraction";
import type { Line, Point, Text } from "@/types/chart";
import { Chart } from "./Chart";
import { Header } from "./Header";
import { PointStyleMenu } from "./PointStyleMenu";
import { TextStyleMenu } from "./TextStyleMenu";
import { Sidebar } from "./Sidebar";
import { CodeDrawer } from "./CodeDrawer";
import { Toolbar, type AxesMode } from "./Toolbar";


export const ChartContainer = () => {
  const {
    chartData,
    isAddingPoints,
    isAddingCurves,
    isAddingText,
    isDeletingLines,
    draggedPointId,
    draggedTextId,
    setDraggedTextId,
    isDragging,
    hoveredLineId,
    cursorPosition,
    pointStyleMenu,
    controlPointPreview,
    axesMode,
    showGrid,
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
    removeLine,
    removePoint,
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
    setAxesModeHandler,
    toggleGrid,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useChart();

  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);

  // Keyboard event listener for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key, 'Ctrl:', event.ctrlKey, 'Meta:', event.metaKey, 'Shift:', event.shiftKey);

      // Check if Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        console.log('Undo/Redo key combination detected');
        event.preventDefault();

        // Check if Shift is also pressed for redo (Ctrl+Shift+Z or Cmd+Shift+Z)
        if (event.shiftKey) {
          console.log('Redo attempt - canRedo:', canRedo);
          if (canRedo) {
            redo();
          }
        } else {
          console.log('Undo attempt - canUndo:', canUndo);
          if (canUndo) {
            undo();
          }
        }
      }

      // Also support Ctrl+Y for redo (Windows/Linux)
      if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        console.log('Ctrl+Y detected - canRedo:', canRedo);
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  // Canvas interaction hook
  const canvasInteraction = useCanvasInteraction({
    onItemClick: (interaction: InteractionEvent) => {
      // Handle delete mode first
      if (isDeletingLines) {
        if (interaction.item.type === "point") {
          console.log("🗑️ Deleting point:", interaction.item.id);
          removePoint(interaction.item.id);
          return;
        } else if (interaction.item.type === "text") {
          console.log("🗑️ Deleting text:", interaction.item.id);
          removeText(interaction.item.id);
          return;
        }
      }

      // Handle normal menu opening
      if (interaction.item.type === "point") {
        openPointStyleMenu(
          interaction.item.id,
          interaction.position.x,
          interaction.position.y,
        );
      } else if (interaction.item.type === "text") {
        // Open style menu with default position (will be updated when input renders)
        setTextStyleMenu({
          text: interaction.item.data,
          x: interaction.position.x + 50, // Temporary position
          y: interaction.position.y - 30, // Temporary position
        });

        // Start inline editing
        const text = interaction.item.data;
        console.log("🔧 Setting editingText:", text);
        setEditingText({
          id: text.id,
          content: text.content,
          x: text.x,
          y: text.y,
          fontSize: text.fontSize,
          color: text.color,
          fontFamily: text.fontFamily,
        });
      }
    },
    onItemDragStart: (interaction: InteractionEvent) => {
      if (interaction.item.type === "point") {
        startDragging(
          interaction.item.id,
          interaction.position.x,
          interaction.position.y,
        );
      } else if (interaction.item.type === "text") {
        setDraggedTextId(interaction.item.id);
      }
    },
    onItemDragMove: (interaction: InteractionEvent) => {
      // Convert screen coordinates to chart coordinates
      const rect = document
        .querySelector(".chart-container")
        ?.getBoundingClientRect();
      if (rect) {
        const x = interaction.position.x - rect.left - 40;
        const y = interaction.position.y - rect.top - 40;
        const clampedX = Math.max(0, Math.min(x, 800 - 80));
        const clampedY = Math.max(0, Math.min(y, 600 - 80));

        if (interaction.item.type === "point") {
          updatePointPosition(interaction.item.id, clampedX, clampedY);
        } else if (interaction.item.type === "text") {
          updateTextPosition(interaction.item.id, clampedX, clampedY);
        }
      }
    },
    onItemDragEnd: (interaction: InteractionEvent) => {
      if (interaction.item.type === "point") {
        stopDragging();
      } else if (interaction.item.type === "text") {
        setDraggedTextId(null);
      }
    },
    onToolActivation: (x: number, y: number, event: React.MouseEvent) => {
      handleChartClick(x, y, event);
    },
    isDraggingExternal: isDragging,
    shouldOpenMenu,
    isDeleteMode: isDeletingLines,
  });

  const [editingText, setEditingText] = useState<{
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
  } | null>(null);

  const [textStyleMenu, setTextStyleMenu] = useState<{
    text: Text;
    x: number;
    y: number;
  } | null>(null);

  const handlePointClick = (point: Point, event: React.MouseEvent) => {
    if (isDeletingLines) {
      removePoint(point.id);
      return;
    }

    const canvasItem: CanvasItem = {
      id: point.id,
      type: "point",
      data: point,
    };

    canvasInteraction.handleItemInteraction(canvasItem, event);
  };

  const handleChartClick = (x: number, y: number, event?: React.MouseEvent) => {
    console.log("🔧 handleChartClick called:", { x, y, isAddingText, isAddingPoints, isDeletingLines });

    // Allow delete tool to activate even when interacting with objects
    // Other tools should be blocked when interacting with objects
    if (canvasInteraction.shouldPreventToolActivation && !isDeletingLines) {
      console.log("🔧 Tool activation prevented by canvasInteraction");
      return;
    }

    if (isAddingPoints) {
      console.log("🔧 Adding point");
      addPointByClick(x, y);
    } else if (isAddingText && event) {
      console.log("🔧 Adding text at coordinates:", { x, y });
      // Get the SVG element position to calculate correct screen coordinates
      const svgElement = event.currentTarget;
      const containerRect = svgElement.getBoundingClientRect();
      console.log("🔧 SVG container rect:", containerRect);

      // Add new text directly
      addText(x, y, "Novo texto");
    } else {
      console.log("🔧 No action taken - conditions not met");
    }
  };

  const handleLineClick = (line: Line, x: number, y: number) => {
    if (isAddingCurves) {
      addControlPointToLine(line.id, x, y);
    } else if (isDeletingLines) {
      removeLine(line.id);
    }
  };

  const handleLineMouseMove = (line: Line, x: number, y: number) => {
    if (isAddingCurves) {
      if (x === 0 && y === 0) {
        // Clear preview when mouse leaves the line
        updateControlPointPreview(null);
      } else {
        updateControlPointPreview(line.id, x, y);
      }
    }
  };

  const handleTextDragStart = (
    textId: string,
    startX: number,
    startY: number,
    event: React.MouseEvent,
  ) => {
    const text = chartData.texts.find((t) => t.id === textId);
    if (!text) return;

    const canvasItem: CanvasItem = {
      id: textId,
      type: "text",
      data: text,
    };

    canvasInteraction.handleItemDragStart(canvasItem, startX, startY, event);
  };

  const handleTextClick = (text: Text, event: React.MouseEvent) => {
    if (isDeletingLines) {
      removeText(text.id);
      return;
    }

    const canvasItem: CanvasItem = {
      id: text.id,
      type: "text",
      data: text,
    };

    canvasInteraction.handleItemInteraction(canvasItem, event);
  };

  const handleTextEdit = (text: Text, event: React.MouseEvent) => {
    // Get the SVG element position to calculate correct screen coordinates
    const svgElement = event.currentTarget.closest("svg");
    const containerRect = svgElement?.getBoundingClientRect();

    if (containerRect) {
      // Start editing with screen coordinates
      setEditingText({
        id: text.id,
        content: text.content,
        x: containerRect.left + text.x + 40, // SVG left + text x + padding
        y: containerRect.top + text.y + 40 - text.fontSize * 0.2, // SVG top + text y + padding - baseline adjustment
        fontSize: text.fontSize,
        color: text.color,
        fontFamily: text.fontFamily,
      });
    } else {
      // Fallback to original method
      setEditingText({
        id: text.id,
        content: text.content,
        x: text.x,
        y: text.y,
        fontSize: text.fontSize,
        color: text.color,
        fontFamily: text.fontFamily,
      });
    }
  };

  const handleTextChange = (textId: string, newContent: string) => {
    // Don't update content in real-time to avoid cursor issues
    // Content will be updated when editing ends
  };

  const handleTextEditEnd = (finalContent: string) => {
    console.log("🔧 handleTextEditEnd called with:", finalContent);
    console.log("🔧 editingText:", editingText);

    if (editingText && finalContent.trim()) {
      console.log("🔧 Updating text content for ID:", editingText.id);
      updateTextContent(editingText.id, finalContent);
    } else {
      console.log("🔧 No update needed - empty content or no editingText");
    }
    setEditingText(null);
  };

  // Update menu position when input is rendered
  useEffect(() => {
    if (editingText && textStyleMenu) {
      const inputElement = document.querySelector(
        ".editing-textarea",
      ) as HTMLTextAreaElement;
      const contentArea = document.querySelector(
        ".flex-1.flex.flex-col",
      ) as HTMLElement; // The main content area

      if (inputElement && contentArea) {
        const inputRect = inputElement.getBoundingClientRect();
        const containerRect = contentArea.getBoundingClientRect();
        // Simple menu positioning logic
        const menuWidth = 320;
        const menuHeight = 400;
        const margin = 10;

        let menuX = inputRect.left;
        let menuY = inputRect.bottom + margin;

        // Adjust if menu goes outside container
        if (menuY + menuHeight > containerRect.bottom - margin) {
          menuY = inputRect.top - menuHeight - margin;
        }
        if (menuX + menuWidth > containerRect.right - margin) {
          menuX = containerRect.right - menuWidth - margin;
        }
        if (menuX < containerRect.left + margin) {
          menuX = containerRect.left + margin;
        }
        if (menuY < containerRect.top + margin) {
          menuY = containerRect.top + margin;
        }

        // Only update if position actually changed
        setTextStyleMenu((prev) => {
          if (!prev) return null;

          const hasChanged =
            Math.abs(prev.x - menuX) > 1 ||
            Math.abs(prev.y - menuY) > 1;

          if (hasChanged) {
            return {
              ...prev,
              x: menuX,
              y: menuY,
            };
          }

          return prev; // Return same object to prevent re-render
        });
      }
    }
  }, [editingText]); // Remove textStyleMenu from dependencies

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
      <Header
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          onToggleAddingPoints={toggleAddingPoints}
          onToggleAddingCurves={toggleAddingCurves}
          onToggleAddingText={toggleAddingText}
          onToggleDeletingLines={toggleDeletingLines}
          onClearChart={clearChart}
          onLineColorChange={changeLineColor}
          onStartNewLine={startNewLine}
          onLineHover={setHoveredLine}
          isAddingPoints={isAddingPoints}
          isAddingCurves={isAddingCurves}
          isAddingText={isAddingText}
          isDeletingLines={isDeletingLines}
          lines={chartData.lines.map((line) => ({
            id: line.id,
            color: line.color,
          }))}
          texts={chartData.texts || []}
          onTextClick={(text) => {
            // Open text style menu (same as clicking on text in canvas)
            setTextStyleMenu({
              text,
              x: 300, // Fixed position since it's from sidebar
              y: 200,
            });
          }}
          onTextDelete={removeText}
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
                texts={chartData.texts || []}
                onPointClick={handlePointClick}
                onLineClick={handleLineClick}
                onLineMouseMove={handleLineMouseMove}
                onChartClick={handleChartClick}
                onTextClick={handleTextClick}
                onTextEdit={handleTextEdit}
                onTextChange={handleTextChange}
                onTextEditEnd={(textId, finalContent) =>
                  handleTextEditEnd(finalContent)
                }
                onTextDragStart={handleTextDragStart}
                editingTextId={editingText?.id || null}
                isAddingPoints={isAddingPoints}
                isAddingCurves={isAddingCurves}
                isAddingText={isAddingText}
                isDeletingLines={isDeletingLines}
                draggedPointId={draggedPointId}
                hoveredLineId={hoveredLineId}
                cursorPosition={cursorPosition}
                controlPointPreview={controlPointPreview}
                onRestartAnimations={restartAnimations}
                onDownloadChart={handleDownloadChart}
                axesMode={axesMode}
                showGrid={showGrid}
                width={800}
                height={600}
                canvasInteraction={canvasInteraction}
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

      {/* Text Style Menu */}
      {textStyleMenu && (
        <TextStyleMenu
          text={textStyleMenu.text}
          x={textStyleMenu.x}
          y={textStyleMenu.y}
          onUpdateText={updateText}
          onClose={() => setTextStyleMenu(null)}
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
