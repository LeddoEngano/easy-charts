import type React from "react";
import type { Text } from "../types/chart";

interface EditableTextProps {
  text: Text;
}

export const EditableText: React.FC<EditableTextProps> = ({ text }) => {
  // Parse text formatting - check for markdown-style formatting
  const parseFormattedText = (content: string) => {
    let formattedContent = content;

    // Check for bold formatting (**text**)
    const isBold = content.startsWith("**") && content.endsWith("**");
    if (isBold) {
      formattedContent = content.slice(2, -2);
    }

    // Check for italic formatting (*text*)
    const isItalic =
      content.startsWith("*") && content.endsWith("*") && !isBold;
    if (isItalic) {
      formattedContent = content.slice(1, -1);
    }

    // Check for underline formatting (__text__)
    const isUnderline = content.startsWith("__") && content.endsWith("__");
    if (isUnderline) {
      formattedContent = content.slice(2, -2);
    }

    return {
      text: formattedContent,
      isBold,
      isItalic,
      isUnderline,
    };
  };

  const {
    text: displayText,
    isBold,
    isItalic,
    isUnderline,
  } = parseFormattedText(text.content);

  return (
    <text
      x={text.x}
      y={text.y}
      fontSize={text.fontSize}
      fill={text.color}
      fontFamily={text.fontFamily}
      fontWeight={isBold ? "bold" : "normal"}
      fontStyle={isItalic ? "italic" : "normal"}
      textDecoration={isUnderline ? "underline" : "none"}
      style={{
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {displayText}
    </text>
  );
};
