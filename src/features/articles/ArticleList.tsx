import { useState } from 'react';
import type { Article, Feed } from '../../types';
import { ArticleItem } from './ArticleItem';
import { Loader } from '../../components/Loader';
import { Welcome } from './Welcome';
import './ArticleList.css';

interface Props {
  articles: Article[];
  feeds: Feed[];
  loading: boolean;
  error: string | null;
  progress?: { loaded: number; total: number } | null;
  onCancel?: () => void;
}

export function ArticleList({ articles, feeds, loading, error, progress, onCancel }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function getArticleId(a: Article) {
    return `${a.feedId}::${a.link}`;
  }

  function handleToggle(a: Article) {
    const id = getArticleId(a);
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return <Loader progress={progress} onCancel={onCancel} />;
  }

  if (feeds.length === 0) {
    return <Welcome />;
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
