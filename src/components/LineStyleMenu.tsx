"use client";

import { useState, useEffect } from "react";
import type { LineStyle } from "@/types/chart";
import { DraggableMenu } from "@/components/ui/DraggableMenu";

interface LineStyleMenuProps {
    isOpen: boolean;
    x: number;
    y: number;
    currentColor: string;
    currentStyle: LineStyle;
    lineId: string;
    onColorChange: (color: string) => void;
    onStyleChange: (style: LineStyle) => void;
    onPreviewStyle: (style: LineStyle) => void;
    onPreviewColor: (color: string) => void;
    onClose: () => void;
}

const styleOptions: Array<{
    value: LineStyle;
    label: string;
    preview: React.ReactNode;
}> = [
        {
            value: "solid",
            label: "Sólida",
            preview: <div className="w-full h-1 bg-current rounded-full" />
        },
        {
            value: "dashed",
            label: "Tracejada",
            preview: <div className="w-full h-1 bg-current rounded-full" style={{ background: "repeating-linear-gradient(to right, currentColor 0, currentColor 10px, transparent 10px, transparent 15px)" }} />
        },
        {
            value: "dotted",
            label: "Pontilhada",
            preview: <div className="w-full h-1 bg-current rounded-full" style={{ background: "repeating-linear-gradient(to right, currentColor 0, currentColor 3px, transparent 3px, transparent 8px)" }} />
        },
        {
            value: "dash-dot",
            label: "Traço-Ponto",
            preview: <div className="w-full h-1 bg-current rounded-full" style={{ background: "repeating-linear-gradient(to right, currentColor 0, currentColor 10px, transparent 10px, transparent 13px, currentColor 13px, currentColor 16px, transparent 16px, transparent 21px)" }} />
        },
        {
            value: "thick",
            label: "Grossa",
            preview: <div className="w-full h-2 bg-current rounded-full" />
        },
        {
            value: "thin",
            label: "Fina",
            preview: <div className="w-full h-0.5 bg-current rounded-full" />
        },
    ];

const quickColors = [
    "#000000", // Black
    "#ef4444", // Red
    "#bfff70", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#3b82f6", // Blue
    "#f97316", // Orange
];

export const LineStyleMenu = ({
    isOpen,
    x,
    y,
    currentColor,
    currentStyle,
    lineId,
    onColorChange,
    onStyleChange,
    onPreviewStyle,
    onPreviewColor,
    onClose,
}: LineStyleMenuProps) => {
    const [colorInput, setColorInput] = useState(currentColor);

    // Update local state when currentColor changes
    useEffect(() => {
        setColorInput(currentColor);
    }, [currentColor]);

    const handleColorChange = (newColor: string) => {
        setColorInput(newColor);
        if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
            onColorChange(newColor);
        }
    };

    if (!isOpen) return null;

    return (
        <DraggableMenu
            title="Configurações da Linha"
            x={x + 10}
            y={y - 100}
            onClose={onClose}
        >
            <div className="space-y-4">
                {/* Color selection section */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Cor da Linha</label>

                    {/* Quick select colors */}
                    <div className="grid grid-cols-4 gap-2">
                        {quickColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => onColorChange(color)}
                                onMouseEnter={() => onPreviewColor(color)}
                                onMouseLeave={() => onPreviewColor(currentColor)}
                                className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${currentColor === color
                                    ? "border-white"
                                    : "border-gray-600"
                                    }`}
                                style={{ backgroundColor: color }}
                                title={`Cor ${color}`}
                            />
                        ))}
                    </div>

                    {/* Custom color input */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => onColorChange((e.target as HTMLInputElement).value)}
                            onMouseEnter={(e) => onPreviewColor((e.target as HTMLInputElement).value)}
                            onMouseLeave={() => onPreviewColor(currentColor)}
                            className="w-8 h-8 rounded border-2 border-gray-600 cursor-pointer bg-transparent"
                            title="Escolher cor"
                        />
                        <input
                            type="text"
                            value={colorInput}
                            onChange={(e) => handleColorChange((e.target as HTMLInputElement).value)}
                            onMouseEnter={(e) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test((e.target as HTMLInputElement).value)) {
                                    onPreviewColor((e.target as HTMLInputElement).value);
                                }
                            }}
                            onMouseLeave={() => onPreviewColor(currentColor)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="#000000"
                            maxLength={7}
                            title="Digite o código hexadecimal"
                        />
                    </div>
                </div>

                {/* Style options section */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Estilo da Linha</label>
                    <div className="space-y-1">
                        {styleOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onStyleChange(option.value)}
                                onMouseEnter={() => onPreviewStyle(option.value)}
                                onMouseLeave={() => onPreviewStyle(currentStyle)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${currentStyle === option.value
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                                    }`}
                            >
                                <div className="flex items-center justify-center w-8 h-4">
                                    {option.preview}
                                </div>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </DraggableMenu>
    );
};
