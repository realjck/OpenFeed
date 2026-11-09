import { describe, it, expect } from 'vitest';
import { arrowGeometry, elbowPoints, HEAD_LENGTH } from './arrow';

describe('elbowPoints', () => {
  it('turns once when leaving and arriving on perpendicular axes', () => {
    const points = elbowPoints({ x: 100, y: 80 }, { x: 20, y: 0 }, 'left', 'up');
    expect(points).toEqual([
      { x: 100, y: 80 },
      { x: 20, y: 80 },
      { x: 20, y: 0 },
    ]);
  });

  it('turns twice, halfway, when leaving and arriving on the same axis', () => {
    const points = elbowPoints({ x: 60, y: 0 }, { x: 40, y: 100 }, 'down', 'down');
    expect(points).toEqual([
      { x: 60, y: 0 },
      { x: 60, y: 50 },
      { x: 40, y: 50 },
      { x: 40, y: 100 },
    ]);
  });

  it('drops the jog when both ends are aligned', () => {
    const points = elbowPoints({ x: 40, y: 0 }, { x: 40, y: 100 }, 'down', 'down');
    expect(points).toEqual([
      { x: 40, y: 0 },
      { x: 40, y: 100 },
    ]);
  });
});

describe('arrowGeometry', () => {
  it('stops the line at the base of the head so it does not poke through the tip', () => {
    const { line } = arrowGeometry({ x: 100, y: 80 }, { x: 20, y: 0 }, 'left', 'up');
    expect(line.endsWith(`20 ${HEAD_LENGTH}`)).toBe(true);
  });

  it('closes a triangle whose apex is the tip', () => {
    const { head } = arrowGeometry({ x: 100, y: 80 }, { x: 20, y: 0 }, 'left', 'up');
    expect(head.startsWith('M 20 0 L')).toBe(true);
    expect(head.endsWith('Z')).toBe(true);
  });
});
