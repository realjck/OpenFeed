import { useState, useEffect } from 'react';
import type { Feed } from '../../types';
import { fetchFeed } from '../../lib/rss';
import { getFeedIconUrl } from '../../lib/favicon';
import './AddFeedModal.css';

interface Props {
  editFeed?: Feed | null;
  onSave: (data: Omit<Feed, 'id'>) => void;
  onUpdate: (feed: Feed) => void;
  onClose: () => void;
}

export function AddFeedModal({ editFeed, onSave, onUpdate, onClose }: Props) {
  const [url, setUrl] = useState(editFeed?.url ?? '');
  const [name, setName] = useState(editFeed?.name ?? '');
  const [siteUrl, setSiteUrl] = useState('');
  const [fetchingName, setFetchingName] = useState(false);

  useEffect(() => {
    if (editFeed) {
      setUrl(editFeed.url);
      setName(editFeed.name);
      setSiteUrl('');
    }
  }, [editFeed]);

  async function handleUrlBlur() {
    if (!url || editFeed || name) return;
    setFetchingName(true);
    try {
      const result = await fetchFeed(url, '', '');
      if (result.channelTitle) setName(result.channelTitle);
      if (result.siteUrl) setSiteUrl(result.siteUrl);
    } catch {
      // silent — user can type name manually
    } finally {
      setFetchingName(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !name) return;
    if (editFeed) {
      onUpdate({ ...editFeed, url, name });
    } else {
      onSave({ url, name, iconUrl: getFeedIconUrl(url, siteUrl) });
    }
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editFeed ? 'Edit Feed' : 'Add Feed'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            <span>URL</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com/feed.xml"
              required
              disabled={!!editFeed}
            />
          </label>
          <label>
            <span>Name {fetchingName && <span className="fetching">(detecting…)</span>}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Feed name"
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {editFeed ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
