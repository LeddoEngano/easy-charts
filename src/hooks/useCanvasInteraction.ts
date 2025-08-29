import { useCallback, useEffect, useState } from "react";

export interface CanvasItem {
  id: string;
  type: "point" | "text" | "line";
  data: any; // The actual item data (Point, Text, Line, etc.)
}

export interface InteractionEvent {
  item: CanvasItem;
  event: React.MouseEvent;
  position: { x: number; y: number };
}

export interface UseCanvasInteractionProps {
  onItemClick?: (interaction: InteractionEvent) => void;
  onItemDragStart?: (interaction: InteractionEvent) => void;
  onItemDragMove?: (interaction: InteractionEvent) => void;
  onItemDragEnd?: (interaction: InteractionEvent) => void;
  onToolActivation?: (x: number, y: number, event: React.MouseEvent) => void;
  isDraggingExternal?: boolean; // From useChart hook
  shouldOpenMenu?: () => boolean; // From useChart hook
  dragThreshold?: number;
  isDeleteMode?: boolean; // Allow delete tool to bypass interaction blocking
}

export const useCanvasInteraction = ({
  onItemClick,
  onItemDragStart,
  onItemDragMove,
  onItemDragEnd,
  onToolActivation,
  isDraggingExternal = false,
  shouldOpenMenu,
  dragThreshold = 5,
  isDeleteMode = false,
}: UseCanvasInteractionProps) => {
  const [lastClickedItem, setLastClickedItem] =
    useState<InteractionEvent | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [recentItemInteraction, setRecentItemInteraction] = useState(false);

  // Effect to handle menu opening after drag ends
  useEffect(() => {
    // Only process if we have a clicked item and no dragging is happening
    if (!isDraggingExternal && !isDraggingItem && lastClickedItem) {
      // Don't open menu if this item was just dragged
      if (draggedItemId !== lastClickedItem.item.id) {
        const canOpen = shouldOpenMenu ? shouldOpenMenu() : true;

        if (canOpen) {
          onItemClick?.(lastClickedItem);
        } else {
          console.log("❌ Menu blocked by shouldOpenMenu");
        }
      } else {
        console.log("❌ Menu blocked - item was dragged");
      }

      setLastClickedItem(null);
      // Keep isItemSelected true for a bit longer to prevent tool activation
      setTimeout(() => {
        setIsItemSelected(false);
      }, 100);
    }
  }, [lastClickedItem, isDraggingExternal, isDraggingItem, draggedItemId]); // Removed shouldOpenMenu and onItemClick to prevent excessive calls

  // Handle item click/selection - only call this for pure clicks, not after drags
  const handleItemInteraction = useCallback(
    (item: CanvasItem, event: React.MouseEvent) => {
      // Don't process click if this item was just being dragged
      if (draggedItemId === item.id) {
        return true;
      }

      event.stopPropagation();

      setIsItemSelected(true);
      setRecentItemInteraction(true);
      setLastClickedItem({
        item,
        event,
        position: { x: event.clientX, y: event.clientY },
      });

      // Clear the recent interaction flag after a short delay
      setTimeout(() => {
        setRecentItemInteraction(false);
      }, 200);

      // Prevent tool activation when item is selected
      return true; // Indicates item was selected
    },
    [draggedItemId],
  );

  // Handle item drag start
  const handleItemDragStart = useCallback(
    (
      item: CanvasItem,
      startX: number,
      startY: number,
      event: React.MouseEvent,
    ) => {
      event.stopPropagation();

      setIsItemSelected(true);
      setRecentItemInteraction(true);
      setIsDraggingItem(false); // Reset initially
      // Don't set draggedItemId yet - only set it if actual drag occurs

      // Clear the recent interaction flag after a delay
      setTimeout(() => {
        setRecentItemInteraction(false);
      }, 200);

      const startPos = { x: startX, y: startY };
      let hasMoved = false;

      const interactionEvent: InteractionEvent = {
        item,
        event,
        position: { x: startX, y: startY },
      };

      onItemDragStart?.(interactionEvent);

      // Global mouse move handler
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const distance = Math.sqrt(
          (e.clientX - startPos.x) ** 2 + (e.clientY - startPos.y) ** 2,
        );

        if (distance > dragThreshold && !hasMoved) {
          hasMoved = true;
          setIsDraggingItem(true);
          setDraggedItemId(item.id); // Only set draggedItemId when actual drag occurs
        }

        onItemDragMove?.({
          item,
          event: event as any, // Keep original event
          position: { x: e.clientX, y: e.clientY },
        });
      };

      // Global mouse up handler
      const handleGlobalMouseUp = (e: MouseEvent) => {
        setIsDraggingItem(false);

        onItemDragEnd?.({
          item,
          event: event as any,
          position: { x: e.clientX, y: e.clientY },
        });

        // Reset selection and clear dragged item ID after a delay
        if (hasMoved) {
          setTimeout(() => {
            setIsItemSelected(false);
            setDraggedItemId(null); // Clear after delay to prevent menu opening
          }, 150);
        }

        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      // Prevent tool activation when dragging starts
      return true; // Indicates drag started
    },
    [dragThreshold, onItemDragStart, onItemDragMove, onItemDragEnd],
  );

  // Handle canvas click (for tool activation)
  const handleCanvasClick = useCallback(
    (x: number, y: number, event: React.MouseEvent) => {
      // Allow delete tool to activate even when interacting with objects
      // Other tools should be blocked when interacting with objects
      const shouldBlock =
        !isDeleteMode &&
        (isItemSelected ||
          isDraggingItem ||
          draggedItemId !== null ||
          recentItemInteraction);

      if (!shouldBlock) {
        onToolActivation?.(x, y, event);
      } else {
        console.log("❌ Tool blocked - item interaction in progress");
      }
    },
    [
      isItemSelected,
      isDraggingItem,
      draggedItemId,
      recentItemInteraction,
      onToolActivation,
    ],
  );

  // Reset states
  const resetInteraction = useCallback(() => {
    setLastClickedItem(null);
    setIsDraggingItem(false);
    setDraggedItemId(null);
    setIsItemSelected(false);
    setRecentItemInteraction(false);
  }, []);

  return {
    // State
    isItemSelected,
    isDraggingItem,
    draggedItemId,
    lastClickedItem,

    // Handlers
    handleItemInteraction,
    handleItemDragStart,
    handleCanvasClick,
    resetInteraction,

    // Utils
    isItemDragged: (itemId: string) => draggedItemId === itemId,
    shouldPreventToolActivation:
      !isDeleteMode &&
      (isItemSelected ||
        isDraggingItem ||
        draggedItemId !== null ||
        recentItemInteraction),
  };
};
