export interface Point {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface Line {
  id: string;
  startPointId: string;
  endPointId: string;
  startPoint: Point;
  endPoint: Point;
  controlPointIds: string[]; // Multiple control points for complex curves
}

export interface ChartData {
  points: Point[];
  lines: Line[];
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: number;
  gridSize: number;
}
