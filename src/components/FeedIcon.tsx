import { useState } from 'react';
import type { Feed } from '../types';
import { getFeedIconUrl } from '../lib/favicon';
import './FeedIcon.css';

interface Props {
  feed: Pick<Feed, 'url' | 'name' | 'iconUrl'>;
}

export function FeedIcon({ feed }: Props) {
  const [failed, setFailed] = useState(false);
  const src = feed.iconUrl || getFeedIconUrl(feed.url);

  if (failed || !src) {
    return (
      <span className="feed-icon-fallback" aria-hidden="true">
        {feed.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className="feed-icon"
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
