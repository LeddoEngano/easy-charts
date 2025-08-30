"use client";

import { useEffect, useState } from "react";
import { MdVisibilityOff } from "react-icons/md";
import { DraggableMenu } from "@/components/ui/DraggableMenu";
import type { PointStyle } from "@/types/chart";

interface PointStyleMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  currentStyle: PointStyle;
  currentLabel?: string;
  pointId: string;
  onStyleChange: (style: PointStyle) => void;
  onLabelChange: (label?: string) => void;
  onPreviewStyle: (style: PointStyle) => void;
  onClose: () => void;
}

const styleOptions: Array<{
  value: PointStyle;
  label: string;
  preview: string | React.ReactNode;
}> = [
  { value: "default", label: "Default", preview: "●" },
  { value: "border", label: "Border", preview: "◉" },
  { value: "hollow", label: "Hollow", preview: "○" },
  { value: "glow", label: "Glow", preview: "✨" },
  {
    value: "radar",
    label: "Radar",
    preview: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-current opacity-60"></div>
        <div className="absolute inset-1 rounded-full border border-current opacity-40"></div>
        <div className="absolute inset-2 rounded-full border border-current opacity-20"></div>
        <div className="absolute inset-3 rounded-full bg-current"></div>
      </div>
    ),
  },
  {
    value: "hidden",
    label: "Hidden",
    preview: <MdVisibilityOff className="text-lg" />,
  },
];

export const PointStyleMenu = ({
  isOpen,
  x,
  y,
  currentStyle,
  currentLabel,
  onStyleChange,
  onLabelChange,
  onPreviewStyle,
  onClose,
}: PointStyleMenuProps) => {
  const [labelInput, setLabelInput] = useState(currentLabel || "");

  // Update local state when currentLabel changes
  useEffect(() => {
    setLabelInput(currentLabel || "");
  }, [currentLabel]);

  const handleLabelChange = (newLabel: string) => {
    setLabelInput(newLabel);
    onLabelChange(newLabel.trim() || undefined);
  };

  const handleRemoveLabel = () => {
    setLabelInput("");
    onLabelChange(undefined);
  };

  if (!isOpen) return null;

  return (
    <DraggableMenu
      title="Point Settings"
      x={x + 10}
      y={y - 100}
      onClose={onClose}
    >
      <div className="space-y-3">
        {/* Label editing section */}
        <div className="space-y-2">
          <label
            htmlFor="point-label"
            className="text-sm font-medium text-gray-300"
          >
            Point Name
          </label>
          <div className="flex gap-2">
            <input
              id="point-label"
              type="text"
              value={labelInput}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Type the name..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {currentLabel && (
              <button
                type="button"
                onClick={handleRemoveLabel}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                title="Remove name"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Style options section */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">
            Point Style
          </div>
          <div className="space-y-1">
            {styleOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => onStyleChange(option.value)}
                onMouseEnter={() => onPreviewStyle(option.value)}
                onMouseLeave={() => onPreviewStyle(currentStyle)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  currentStyle === option.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="text-lg flex items-center justify-center w-5 h-5">
                  {option.preview}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DraggableMenu>
  );
};
