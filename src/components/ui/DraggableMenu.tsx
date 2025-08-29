"use client";

import { motion } from "framer-motion";
import { type ReactNode, useRef, useState } from "react";

interface DraggableMenuProps {
  title: string;
  x: number;
  y: number;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function DraggableMenu({
  title,
  x,
  y,
  onClose,
  children,
  className = "",
}: DraggableMenuProps) {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header
    const target = e.target as HTMLElement;
    if (!target.closest(".menu-header")) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep menu within viewport bounds
    const menuWidth = menuRef.current?.offsetWidth || 300;
    const menuHeight = menuRef.current?.offsetHeight || 400;

    const clampedX = Math.max(0, Math.min(newX, window.innerWidth - menuWidth));
    const clampedY = Math.max(
      0,
      Math.min(newY, window.innerHeight - menuHeight),
    );

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`fixed z-50 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-600 ${className}`}
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? "grabbing" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Draggable Header */}
        <div className="menu-header flex items-center justify-between p-3 border-b border-gray-700 cursor-grab active:cursor-grabbing">
          <h3 className="text-sm font-medium select-none">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Fechar menu"
            >
              <title>Fechar menu</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </motion.div>

      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        aria-label="Fechar menu"
      />
    </>
  );
}
