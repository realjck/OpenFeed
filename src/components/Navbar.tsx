import { useState, useRef, useEffect } from 'react';
import type { Feed, Settings } from '../types';
import './Navbar.css';

interface Props {
  feeds: Feed[];
  activeFeedId: string | null;
  onSelectFeed: (id: string | null) => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  settings: Settings;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onToggleTheme: () => void;
  loading: boolean;
}

export function Navbar({
  feeds, activeFeedId, onSelectFeed, onRefresh, onToggleSidebar,
  settings, onIncreaseFont, onDecreaseFont, onToggleTheme, loading,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeFeed = feeds.find((f) => f.id === activeFeedId) ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="navbar">
      <button className="navbar-btn" onClick={onToggleSidebar} title="Toggle sidebar">
        ☰
      </button>

      <div className="navbar-feed-dropdown" ref={dropdownRef}>
        <button
          className="navbar-feed-btn"
          style={activeFeed ? { color: activeFeed.color, borderColor: activeFeed.color } : undefined}
          onClick={() => setDropdownOpen((o) => !o)}
        >
          <span className="navbar-feed-name">{activeFeed ? activeFeed.name : 'ALL'}</span>
          <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
        </button>
        {dropdownOpen && (
          <ul className="dropdown-list">
            <li>
              <button
                className={`dropdown-item ${activeFeedId === null ? 'active' : ''}`}
                onClick={() => { onSelectFeed(null); setDropdownOpen(false); }}
              >
                ALL
              </button>
            </li>
            {feeds.map((f) => (
              <li key={f.id}>
                <button
                  className={`dropdown-item ${activeFeedId === f.id ? 'active' : ''}`}
                  onClick={() => { onSelectFeed(f.id); setDropdownOpen(false); }}
                >
                  <span className="dot" style={{ background: f.color }} />
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="navbar-btn" onClick={onRefresh} disabled={loading} title="Refresh">
        {loading ? '⟳' : '↻'}
      </button>

      <button className="navbar-btn" onClick={onDecreaseFont} title="Decrease font size">A−</button>
      <button className="navbar-btn" onClick={onIncreaseFont} title="Increase font size">A+</button>

      <button className="navbar-btn" onClick={onToggleTheme} title="Toggle theme">
        {settings.theme === 'dark' ? '☀' : '☾'}
      </button>
    </nav>
  );
}
