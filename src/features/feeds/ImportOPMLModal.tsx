import { useState, useRef } from 'react';
import { parseOPML, fetchOPML, type OPMLFeed } from '../../lib/opml';
import './ImportOPMLModal.css';
import './AddFeedModal.css';

interface Props {
  onImport: (feeds: OPMLFeed[]) => void;
  onClose: () => void;
}

export function ImportOPMLModal({ onImport, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUrlImport(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setImporting(true);
    setError(null);
    try {
      const feeds = await fetchOPML(url);
      if (feeds.length === 0) {
        setError('No feeds found in this OPML.');
      } else {
        onImport(feeds);
        onClose();
      }
    } catch (err) {
      setError('Failed to fetch or parse OPML from URL.');
      console.error(err);
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xml = event.target?.result as string;
      try {
        const feeds = parseOPML(xml);
        if (feeds.length === 0) {
          setError('No feeds found in this OPML file.');
        } else {
          onImport(feeds);
          onClose();
        }
      } catch (err) {
        setError('Failed to parse OPML file.');
        console.error(err);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import OPML</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleUrlImport} className="modal-form">
            <label>
              <span>From URL</span>
              <div className="url-input-group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/subscriptions.opml"
                  required
                />
                <button type="submit" disabled={importing}>
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </label>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="file-import-section">
            <label className="file-label">
              <span>From File</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose OPML File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".opml,.xml"
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {error && <div className="import-error">{error}</div>}
        </div>
        <div className="modal-actions" style={{ padding: '0 20px 20px' }}>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
