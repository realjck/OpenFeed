export interface Feed {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
}

export interface Settings {
  textSize: number;  // px, range 14–36, default 18
  theme: 'light' | 'dark';
}

export interface Article {
  feedId: string;
  feedName: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  imageUrl?: string;
  sourceDomain: string;
}

export const DEFAULT_SETTINGS: Settings = {
  textSize: 18,
  theme: 'dark',
};
