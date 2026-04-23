import { useState } from 'react';
import type { Article, Feed } from '../../types';
import { ArticleItem } from './ArticleItem';
import { Loader } from '../../components/Loader';
import './ArticleList.css';

interface Props {
  articles: Article[];
  feeds: Feed[];
  loading: boolean;
  error: string | null;
}

export function ArticleList({ articles, feeds, loading, error }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function getArticleId(a: Article) {
    return `${a.feedId}::${a.link}`;
  }

  function handleToggle(a: Article) {
    const id = getArticleId(a);
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return <Loader />;
  }

  if (feeds.length === 0) {
    return (
      <div className="article-list-state">
        <div className="welcome-card">
          <h1 className="welcome-title">OPEN FEED</h1>
          <p className="welcome-subtitle">RSS Reader</p>
          <hr className="welcome-divider" />
          <p>Add RSS feeds using the sidebar to get started.</p>
          <p className="welcome-storage">Your feed list is saved locally in your browser.</p>
          <a
            className="welcome-github"
            href="https://github.com/realjck/OpenFeed/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fork me on GitHub
          </a>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="article-list-state">
        {error
          ? <p className="error-text">Error: {error}</p>
          : <p>No articles found.</p>
        }
      </div>
    );
  }

  return (
    <div>
      {error && <div className="article-list-error">{error}</div>}
      <ul className="article-list">
        {articles.map((a) => {
          const id = getArticleId(a);
          return (
            <ArticleItem
              key={id}
              article={a}
              expanded={expandedId === id}
              onToggle={() => handleToggle(a)}
            />
          );
        })}
      </ul>
    </div>
  );
}
