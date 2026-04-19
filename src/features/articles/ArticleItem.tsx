import { getFaviconUrl } from '../../lib/favicon';
import type { Article } from '../../types';
import './ArticleItem.css';

interface Props {
  article: Article;
  expanded: boolean;
  onToggle: () => void;
}

export function ArticleItem({ article, expanded, onToggle }: Props) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(article.pubDate));

  return (
    <li
      className={`article-item ${expanded ? 'article-item--expanded' : ''}`}
      onClick={onToggle}
    >
      <span className="article-color-bar" style={{ background: article.feedColor }} />
      <div className="article-main">
        <div className="article-meta">
          <img
            className="article-favicon"
            src={getFaviconUrl(article.sourceDomain)}
            alt=""
            loading="lazy"
          />
          <span className="article-feed-name">{article.feedName}</span>
          <span className="article-date">{formattedDate}</span>
        </div>
        <div className="article-body">
          <p className="article-title">{article.title}</p>
          {expanded && (
            <div className="article-detail" onClick={(e) => e.stopPropagation()}>
              {article.imageUrl && (
                <img
                  className="article-image"
                  src={article.imageUrl}
                  alt=""
                  loading="lazy"
                />
              )}
              {article.description && (
                <p className="article-description">
                  {article.description.length > 1000
                    ? `${article.description.substring(0, 1000)}...`
                    : article.description}
                </p>
              )}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="article-link-btn"
              >
                Read article →
              </a>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
