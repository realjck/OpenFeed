import { useState, useEffect, useRef } from 'react';
import { useSettings } from './features/settings/useSettings';
import { useFeeds } from './features/feeds/useFeeds';
import { useArticles } from './features/articles/useArticles';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ConfirmModal } from './components/ConfirmModal';
import { AddFeedModal } from './features/feeds/AddFeedModal';
import { ImportOPMLModal } from './features/feeds/ImportOPMLModal';
import { ArticleList } from './features/articles/ArticleList';
import type { Feed } from './types';
import { type OPMLFeed, generateOPML } from './lib/opml';
import './index.css';

export default function App() {
  const { settings, setTextSize, toggleTheme } = useSettings();
  const { feeds, addFeed, updateFeed, removeFeed, importFeeds } = useFeeds();
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const { articles, loading, error, refresh } = useArticles(feeds, activeFeedId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingRefreshRef = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOPMLOpen, setImportOPMLOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [deletingFeed, setDeletingFeed] = useState<Feed | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  function handleAddFeed() {
    setEditingFeed(null);
    setModalOpen(true);
  }

  function handleEditFeed(feed: Feed) {
    setEditingFeed(feed);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingFeed(null);
  }

  async function handleImportOPML(importedFeeds: OPMLFeed[]) {
    const newFeedsData = importedFeeds
      .filter((f) => !feeds.some((existing) => existing.url === f.url))
      .map((f) => ({ name: f.name, url: f.url }));

    if (newFeedsData.length > 0) {
      await importFeeds(newFeedsData);
      pendingRefreshRef.current = true;
    }
    setImportOPMLOpen(false);
  }

  function handleCloseSidebar() {
    setSidebarOpen(false);
    if (pendingRefreshRef.current) {
      pendingRefreshRef.current = false;
      refresh();
    }
  }

  function confirmDelete() {
    if (deletingFeed) {
      removeFeed(deletingFeed.id);
      if (activeFeedId === deletingFeed.id) setActiveFeedId(null);
      setDeletingFeed(null);
      pendingRefreshRef.current = true;
    }
  }
  
  function handleExportOPML() {
    if (feeds.length === 0) return;
    const opml = generateOPML(feeds.map(f => ({ name: f.name, url: f.url })));
    const blob = new Blob([opml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create filename: openfeed-YYYY-MM-DD-HH-MM-SS.opml.xml
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const filename = `openfeed-${YYYY}-${MM}-${DD}-${HH}-${mm}-${ss}.opml.xml`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="app-container"
      style={{ '--article-fs': `${settings.textSize}px` } as React.CSSProperties}
    >
      <Navbar
        feeds={feeds}
        activeFeedId={activeFeedId}
        onSelectFeed={(id) => { setActiveFeedId(id); window.scrollTo({ top: 0, behavior: 'instant' }); }}
        onRefresh={refresh}
        onToggleSidebar={() => { if (sidebarOpen) handleCloseSidebar(); else setSidebarOpen(true); }}
        settings={settings}
        onIncreaseFont={() => setTextSize(settings.textSize + 1)}
        onDecreaseFont={() => setTextSize(settings.textSize - 1)}
        onToggleTheme={toggleTheme}
        loading={loading}
      />
      <Sidebar
        open={sidebarOpen}
        feeds={feeds}
        onClose={handleCloseSidebar}
        onAddFeed={handleAddFeed}
        onImportOPML={() => setImportOPMLOpen(true)}
        onEditFeed={handleEditFeed}
        onDeleteFeed={(id) => setDeletingFeed(feeds.find((f) => f.id === id) || null)}
        onExportOPML={handleExportOPML}
      />
      <main className={sidebarOpen ? 'blurred' : ''}>
        <ArticleList
          articles={articles}
          feeds={feeds}
          loading={loading}
          error={error}
        />
      </main>
      {modalOpen && (
        <AddFeedModal
          editFeed={editingFeed}
          onSave={async (data) => { await addFeed(data); pendingRefreshRef.current = true; }}
          onUpdate={updateFeed}
          onClose={handleCloseModal}
        />
      )}
      {importOPMLOpen && (
        <ImportOPMLModal
          onImport={handleImportOPML}
          onClose={() => setImportOPMLOpen(false)}
        />
      )}
      {deletingFeed && (
        <ConfirmModal
          title="Delete Feed"
          message={`Are you sure you want to delete "${deletingFeed.name}"?`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeletingFeed(null)}
        />
      )}
    </div>
  );
}
