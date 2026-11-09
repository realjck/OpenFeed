import { useLayoutEffect, useRef, useState } from 'react';
import { arrowGeometry, type Direction, type Point } from '../lib/arrow';
import './GuideArrow.css';

interface Props {
  /** Returns the arrow start, in viewport coordinates, or null if not measurable yet. */
  getStart: () => Point | null;
  /** Returns the arrow tip, in viewport coordinates, or null if not measurable yet. */
  getTip: () => Point | null;
  leave: Direction;
  arrive: Direction;
}

/** Orthogonal arrow overlaid on its positioned parent, kept in place on resize. */
export function GuideArrow(props: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const propsRef = useRef(props);
  const [paths, setPaths] = useState<ReturnType<typeof arrowGeometry> | null>(null);

  useLayoutEffect(() => {
    propsRef.current = props;
  });

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function measure() {
      const { getStart, getTip, leave, arrive } = propsRef.current;
      const origin = svg!.getBoundingClientRect();
      const start = getStart();
      const tip = getTip();
      if (!start || !tip) return;
      const local = (p: Point) => ({ x: p.x - origin.left, y: p.y - origin.top });
      setPaths(arrowGeometry(local(start), local(tip), leave, arrive));
    }

    measure();
    const observer = new ResizeObserver(measure);
    // Siblings too: an anchor can move without its container changing size.
    const parent = svg.parentElement ?? svg;
    [parent, ...Array.from(parent.children)].forEach((el) => observer.observe(el));
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <svg ref={svgRef} className="guide-arrow" aria-hidden="true">
      {paths && (
        <>
          <path className="guide-arrow-anchor" d={paths.anchor} />
          <path className="guide-arrow-line" d={paths.line} pathLength={1} />
          <path className="guide-arrow-head" d={paths.head} />
        </>
      )}
    </svg>
  );
}
