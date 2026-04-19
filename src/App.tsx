import { useState, useEffect } from 'react';
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
import { FEED_COLORS } from './types';
import { type OPMLFeed } from './lib/opml';
import './index.css';

export default function App() {
  const { settings, setTextSize, toggleTheme } = useSettings();
  const { feeds, addFeed, updateFeed, removeFeed, importFeeds } = useFeeds();
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const { articles, loading, error, refresh } = useArticles(feeds, activeFeedId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      .map((f) => ({
        name: f.name,
        url: f.url,
        color: FEED_COLORS[Math.floor(Math.random() * FEED_COLORS.length)],
      }));

    if (newFeedsData.length > 0) {
      await importFeeds(newFeedsData);
    }
    setImportOPMLOpen(false);
  }


  function confirmDelete() {
    if (deletingFeed) {
      removeFeed(deletingFeed.id);
      if (activeFeedId === deletingFeed.id) setActiveFeedId(null);
      setDeletingFeed(null);
    }
  }

  return (
    <div
      className="app-container"
      style={{ '--article-fs': `${settings.textSize}px` } as React.CSSProperties}
    >
      <Navbar
        feeds={feeds}
        activeFeedId={activeFeedId}
        onSelectFeed={setActiveFeedId}
        onRefresh={refresh}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        settings={settings}
        onIncreaseFont={() => setTextSize(settings.textSize + 1)}
        onDecreaseFont={() => setTextSize(settings.textSize - 1)}
        onToggleTheme={toggleTheme}
        loading={loading}
      />
      <Sidebar
        open={sidebarOpen}
        feeds={feeds}
        onClose={() => setSidebarOpen(false)}
        onAddFeed={handleAddFeed}
        onImportOPML={() => setImportOPMLOpen(true)}
        onEditFeed={handleEditFeed}
        onDeleteFeed={(id) => setDeletingFeed(feeds.find((f) => f.id === id) || null)}
      />
      <main>
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
          onSave={addFeed}
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
