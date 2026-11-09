import { useRef } from 'react';
import { GuideArrow } from '../../components/GuideArrow';
import './Welcome.css';


/** Empty state shown when no feed is saved: points the user to the sidebar toggle. */
export function Welcome() {
  const hintRef = useRef<HTMLSpanElement>(null);

  function getStart() {
    // First line box only, so the arrow leaves the start of the sentence when it wraps.
    const rect = hintRef.current?.getClientRects()[0];
    return rect ? { x: rect.left - 16, y: rect.top + rect.height / 2 } : null;
  }

  function getTip() {
    const toggle = document.getElementById('sidebar-toggle');
    const rect = toggle?.getBoundingClientRect();
    // Below the navbar edge: the sticky navbar is stacked above the arrow and would hide the tip.
    const navBottom = toggle?.closest('nav')?.getBoundingClientRect().bottom;
    return rect && navBottom ? { x: rect.left + rect.width / 2, y: navBottom + 6 } : null;
  }

  return (
    <div className="welcome">
      <GuideArrow getStart={getStart} getTip={getTip} leave="left" arrive="up" />
      <p className="welcome-hint">
        <span ref={hintRef}>Add RSS feeds using the sidebar to get started.</span>
      </p>
      <div className="welcome-card">
        <h1 className="welcome-title">OPEN FEED</h1>
        <p className="welcome-subtitle">RSS Reader</p>
        <hr className="welcome-divider" />
        <p className="welcome-storage">Your feed list is saved locally in your browser.</p>
      </div>
    </div>
  );
}
