"use client";

import type { PointStyle } from "@/types/chart";
import { DraggableMenu } from "@/components/ui/DraggableMenu";

interface PointStyleMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  currentStyle: PointStyle;
  onStyleChange: (style: PointStyle) => void;
  onClose: () => void;
}

const styleOptions: Array<{
  value: PointStyle;
  label: string;
  preview: string;
}> = [
  { value: "default", label: "Padrão", preview: "●" },
  { value: "border", label: "Borda", preview: "◉" },
  { value: "hollow", label: "Vazio", preview: "○" },
  { value: "glow", label: "Glow", preview: "✨" },
  { value: "radar", label: "Radar", preview: "⊚" },
  { value: "hidden", label: "Oculto", preview: "👁️" },
];

export const PointStyleMenu = ({
  isOpen,
  x,
  y,
  currentStyle,
  onStyleChange,
  onClose,
}: PointStyleMenuProps) => {
  if (!isOpen) return null;

  return (
    <DraggableMenu
      title="Estilo do Ponto"
      x={x + 10}
      y={y - 100}
      onClose={onClose}
    >
      <div className="space-y-1">
        {styleOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStyleChange(option.value)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
              currentStyle === option.value
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span className="text-lg">{option.preview}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </DraggableMenu>
  );
};
