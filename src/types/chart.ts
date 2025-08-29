export type PointStyle =
  | "default"
  | "border"
  | "hollow"
  | "glow"
  | "radar"
  | "hidden";

export type LineStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "dash-dot"
  | "thick"
  | "thin";

export interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
  color: string; // Color of the point
  style: PointStyle; // Style of the point
}

export interface Line {
  id: string;
  startPointId: string;
  endPointId: string;
  startPoint: Point;
  endPoint: Point;
  controlPointIds: string[]; // Multiple control points for complex curves
  color: string; // Color of the line
  style: LineStyle; // Style of the line
}

export interface Text {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  fontFamily: string;
}

export interface ChartData {
  points: Point[];
  lines: Line[];
  texts: Text[];
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: number;
  gridSize: number;
}
