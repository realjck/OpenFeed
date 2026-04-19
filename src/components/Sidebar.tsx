import type { Feed } from '../types';
import './Sidebar.css';

interface Props {
  open: boolean;
  feeds: Feed[];
  onClose: () => void;
  onAddFeed: () => void;
  onEditFeed: (feed: Feed) => void;
  onDeleteFeed: (id: string) => void;
}

export function Sidebar({ open, feeds, onClose, onAddFeed, onEditFeed, onDeleteFeed }: Props) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">RSS Feeds</span>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>
        <ul className="sidebar-feed-list">
          {feeds.length === 0 && (
            <li className="sidebar-empty">No feeds yet.</li>
          )}
          {feeds.map((f) => (
            <li key={f.id} className="sidebar-feed-item">
              <span className="sidebar-feed-dot" style={{ background: f.color }} />
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
        <button className="sidebar-add-btn" onClick={onAddFeed}>＋ Add Feed</button>
      </aside>
    </>
  );
}
