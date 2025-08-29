"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Text } from "@/types/chart";
import { Button } from "@/components/ui/button";
import { DraggableMenu } from "@/components/ui/DraggableMenu";

interface TextStyleMenuProps {
  text: Text;
  x: number;
  y: number;
  onUpdateText: (textId: string, updates: Partial<Text>) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Georgia", value: "Georgia" },
  { name: "Verdana", value: "Verdana" },
  { name: "Courier New", value: "Courier New" },
  { name: "Impact", value: "Impact" },
  { name: "Comic Sans MS", value: "Comic Sans MS" },
];

const QUICK_COLORS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
  "#008000",
  "#ffc0cb",
  "#a52a2a",
  "#808080",
  "#000080",
  "#800000",
];

export function TextStyleMenu({
  text,
  x,
  y,
  onUpdateText,
  onClose,
}: TextStyleMenuProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [customColor, setCustomColor] = useState(text.color);
  const [localFontSize, setLocalFontSize] = useState(text.fontSize);
  const [localContent, setLocalContent] = useState(
    text.content
      .replace(/^\*\*(.*)\*\*$/, "$1")
      .replace(/^\*(.*)\*$/, "$1")
      .replace(/^__(.*)__$/, "$1")
  );

  // Sync local state with text prop when it changes
  React.useEffect(() => {
    setLocalFontSize(text.fontSize);
    setLocalContent(
      text.content
        .replace(/^\*\*(.*)\*\*$/, "$1")
        .replace(/^\*(.*)\*$/, "$1")
        .replace(/^__(.*)__$/, "$1")
    );
  }, [text.fontSize, text.content]);

  const handleStyleChange = (style: string) => {
    const currentContent = text.content;
    let newContent = currentContent;

    // Clean content from all formatting first
    let cleanContent = currentContent;
    cleanContent = cleanContent.replace(/^\*\*(.*)\*\*$/, "$1"); // Remove bold
    cleanContent = cleanContent.replace(/^\*(.*)\*$/, "$1"); // Remove italic
    cleanContent = cleanContent.replace(/^__(.*)__$/, "$1"); // Remove underline

    switch (style) {
      case "bold":
        newContent = isBold ? cleanContent : `**${cleanContent}**`;
        break;
      case "italic":
        newContent = isItalic ? cleanContent : `*${cleanContent}*`;
        break;
      case "underline":
        newContent = isUnderline ? cleanContent : `__${cleanContent}__`;
        break;
    }

    onUpdateText(text.id, { content: newContent });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onUpdateText(text.id, { fontFamily });
  };

  const handleFontSizeChange = (fontSize: number) => {
    setLocalFontSize(fontSize);
    onUpdateText(text.id, { fontSize });
  };

  const handleColorChange = (color: string) => {
    onUpdateText(text.id, { color });
    setCustomColor(color);
  };

  const isBold = text.content.startsWith("**") && text.content.endsWith("**");
  const isItalic =
    text.content.startsWith("*") &&
    text.content.endsWith("*") &&
    !text.content.startsWith("**");
  const isUnderline =
    text.content.startsWith("__") && text.content.endsWith("__");

  return (
    <DraggableMenu
      title="Estilo do Texto"
      x={x}
      y={y}
      onClose={onClose}
      className="w-80"
    >
      {/* Text Content Editor */}
      <div className="mb-3">
        <label className="block text-xs text-gray-300 mb-1">Conteúdo</label>
        <input
          type="text"
          value={localContent}
          onChange={(e) => {
            const newContent = e.target.value;
            console.log("🔧 Content changed:", newContent);
            setLocalContent(newContent);
            onUpdateText(text.id, { content: newContent });
          }}
          onKeyDown={(e) => {
            console.log("🔧 Key pressed:", e.key);
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          placeholder="Digite o conteúdo do texto..."
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <p className="text-xs text-gray-400 mt-1">
          Edite o conteúdo diretamente aqui
        </p>
      </div>

      {/* Text Style Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          onClick={() => handleStyleChange("bold")}
          variant={isBold ? "default" : "secondary"}
          size="sm"
          title="Negrito"
          className="px-3 py-1 text-xs font-bold"
        >
          B
        </Button>
        <Button
          onClick={() => handleStyleChange("italic")}
          variant={isItalic ? "default" : "secondary"}
          size="sm"
          title="Itálico"
          className="px-3 py-1 text-xs italic"
        >
          I
        </Button>
        <Button
          onClick={() => handleStyleChange("underline")}
          variant={isUnderline ? "default" : "secondary"}
          size="sm"
          title="Sublinhado"
          className="px-3 py-1 text-xs underline"
        >
          U
        </Button>
      </div>

      {/* Font Family */}
      <div className="mb-3">
        <label className="block text-xs text-gray-300 mb-1">Fonte</label>
        <select
          value={text.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="mb-3">
        <label className="block text-xs text-gray-300 mb-1">Tamanho</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="8"
            max="48"
            value={localFontSize}
            onChange={(e) => {
              handleFontSizeChange(Number(e.target.value));
            }}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((localFontSize - 8) / (48 - 8)) * 100}%, #374151 ${((localFontSize - 8) / (48 - 8)) * 100}%, #374151 100%)`,
            }}
          />
          <span className="text-xs w-8 text-center">{localFontSize}px</span>
        </div>
      </div>

      {/* Color */}
      <div className="mb-3">
        <label className="block text-xs text-gray-300 mb-1">Cor</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="w-8 h-8 rounded border-2 border-gray-600"
            style={{ backgroundColor: text.color }}
            title="Escolher cor"
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Colors */}
      {isColorPickerOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-1 mb-3"
        >
          {QUICK_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </motion.div>
      )}
    </DraggableMenu>
  );
}
