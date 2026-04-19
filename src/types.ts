export interface Feed {
  id: string;
  name: string;
  url: string;
  color: string;
}

export interface Settings {
  textSize: number;  // px, range 14–36, default 18
  theme: 'light' | 'dark';
}

export interface Article {
  feedId: string;
  feedColor: string;
  feedName: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  imageUrl?: string;
  sourceDomain: string;
}

export const FEED_COLORS = [
  '#DC2626',
  '#F97316',
  '#FFB800',
  '#16A34A',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#475569',
] as const;

export const DEFAULT_SETTINGS: Settings = {
  textSize: 18,
  theme: 'dark',
};
