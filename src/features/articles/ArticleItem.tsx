import { getFaviconUrl } from '../../lib/favicon';
import type { Article } from '../../types';
import './ArticleItem.css';

interface Props {
  article: Article;
  expanded: boolean;
  onToggle: () => void;
}

export function ArticleItem({ article, expanded, onToggle }: Props) {
  return (
    <li
      className={`article-item ${expanded ? 'article-item--expanded' : ''}`}
      onClick={onToggle}
    >
      <span className="article-color-bar" style={{ background: article.feedColor }} />
      <img
        className="article-favicon"
        src={getFaviconUrl(article.sourceDomain)}
        alt=""
        width={16}
        height={16}
        loading="lazy"
      />
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
              <p className="article-description">{article.description}</p>
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
    </li>
  );
}
