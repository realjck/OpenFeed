export interface Point {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const HEAD_LENGTH = 12;
const HEAD_HALF_WIDTH = 6;
const ANCHOR_SIZE = 7;

const UNIT: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const isVertical = (d: Direction) => d === 'up' || d === 'down';
const fmt = (n: number) => Number(n.toFixed(1));
const pt = (p: Point) => `${fmt(p.x)} ${fmt(p.y)}`;

/** Orthogonal route from `start` to `tip`: one corner on perpendicular axes, two (halfway) on the same axis. */
export function elbowPoints(start: Point, tip: Point, leave: Direction, arrive: Direction): Point[] {
  if (isVertical(leave) !== isVertical(arrive)) {
    const corner = isVertical(leave) ? { x: start.x, y: tip.y } : { x: tip.x, y: start.y };
    return [start, corner, tip];
  }
  if (isVertical(leave) ? start.x === tip.x : start.y === tip.y) {
    return [start, tip];
  }
  if (isVertical(leave)) {
    const midY = (start.y + tip.y) / 2;
    return [start, { x: start.x, y: midY }, { x: tip.x, y: midY }, tip];
  }
  const midX = (start.x + tip.x) / 2;
  return [start, { x: midX, y: start.y }, { x: midX, y: tip.y }, tip];
}

/** SVG paths for an orthogonal arrow: a square anchor at the start, the line, and a filled triangular head. */
export function arrowGeometry(start: Point, tip: Point, leave: Direction, arrive: Direction) {
  const dir = UNIT[arrive];
  const base = { x: tip.x - dir.x * HEAD_LENGTH, y: tip.y - dir.y * HEAD_LENGTH };
  const points = elbowPoints(start, tip, leave, arrive);
  points[points.length - 1] = base;
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pt(p)}`).join(' ');

  const side = { x: -dir.y * HEAD_HALF_WIDTH, y: dir.x * HEAD_HALF_WIDTH };
  const head = `M ${pt(tip)} L ${pt({ x: base.x + side.x, y: base.y + side.y })} L ${pt({ x: base.x - side.x, y: base.y - side.y })} Z`;

  const h = ANCHOR_SIZE / 2;
  const anchor = `M ${pt({ x: start.x - h, y: start.y - h })} h ${ANCHOR_SIZE} v ${ANCHOR_SIZE} h -${ANCHOR_SIZE} Z`;

  return { anchor, line, head };
}
