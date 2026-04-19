import { useState } from 'react';
import { useSettings } from './features/settings/useSettings';
import { useFeeds } from './features/feeds/useFeeds';
import { useArticles } from './features/articles/useArticles';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AddFeedModal } from './features/feeds/AddFeedModal';
import { ArticleList } from './features/articles/ArticleList';
import type { Feed } from './types';
import './index.css';

export default function App() {
  const { settings, setTextSize, toggleTheme } = useSettings();
  const { feeds, addFeed, updateFeed, removeFeed } = useFeeds();
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const { articles, loading, error, refresh } = useArticles(feeds, activeFeedId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);

  function handleAddFeed() {
    setEditingFeed(null);
    setModalOpen(true);
  }

  function handleEditFeed(feed: Feed) {
    setEditingFeed(feed);
    setModalOpen(true);
    setSidebarOpen(false);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingFeed(null);
  }

  return (
    <div
      data-theme={settings.theme}
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
        onEditFeed={handleEditFeed}
        onDeleteFeed={removeFeed}
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
    </div>
  );
}
