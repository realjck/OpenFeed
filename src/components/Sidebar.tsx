import type { Feed } from '../types';
import { useRef } from 'react';
import { FeedIcon } from './FeedIcon';
import { GuideArrow } from './GuideArrow';
import './Sidebar.css';

const REPO_URL = 'https://github.com/realjck/OpenFeed/';

interface Props {
  open: boolean;
  feeds: Feed[];
  onClose: () => void;
  onAddFeed: () => void;
  onImportOPML: () => void;
  onEditFeed: (feed: Feed) => void;
  onDeleteFeed: (id: string) => void;
  onExportOPML: () => void;
}

export function Sidebar({ open, feeds, onClose, onAddFeed, onImportOPML, onExportOPML, onEditFeed, onDeleteFeed }: Props) {
  const emptyRef = useRef<HTMLLIElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const isEmpty = feeds.length === 0;

  function getArrowStart() {
    const rect = emptyRef.current?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.bottom + 16 } : null;
  }

  function getArrowTip() {
    const rect = addBtnRef.current?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top - 4 } : null;
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">RSS Feeds</span>
          <a
            className="sidebar-repo"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Source code on GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>v{__APP_VERSION__}</span>
          </a>
          <button className="sidebar-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="14" y2="14"/>
              <line x1="14" y1="2" x2="2" y2="14"/>
            </svg>
          </button>
        </div>
        <ul className="sidebar-feed-list">
          {isEmpty && (
            <li className="sidebar-empty" ref={emptyRef}>
              <p className="sidebar-empty-title">Add your first feed</p>
              <p className="sidebar-empty-text">
                Paste the address of any RSS or Atom feed, or import an OPML file exported from another reader.
              </p>
            </li>
          )}
          {feeds.map((f) => (
            <li key={f.id} className="sidebar-feed-item">
              <FeedIcon feed={f} />
              <div className="sidebar-feed-info">
                <span className="sidebar-feed-name">{f.name}</span>
                <span className="sidebar-feed-url">{f.url}</span>
              </div>
              <div className="sidebar-feed-actions">
                <button onClick={() => onEditFeed(f)} title="Edit">✎</button>
                <button onClick={() => onDeleteFeed(f.id)} title="Delete">✕</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="sidebar-add-btn" onClick={onAddFeed} ref={addBtnRef}>＋ Add Feed</button>
          <button className="sidebar-import-btn" onClick={onImportOPML}>⤓ Import OPML</button>
          <button className="sidebar-import-btn" onClick={onExportOPML} disabled={feeds.length === 0}>⤴ Export OPML</button>
        </div>
        {open && isEmpty && (
          <GuideArrow getStart={getArrowStart} getTip={getArrowTip} leave="down" arrive="down" />
        )}
      </aside>
    </>
  );
}
