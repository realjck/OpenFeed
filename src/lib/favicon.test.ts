import { describe, it, expect } from 'vitest';
import { getFaviconUrl } from './favicon';

describe('getFaviconUrl', () => {
  it('builds Google favicon URL', () => {
    expect(getFaviconUrl('example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=example.com&sz=32'
    );
  });

  it('handles domain with subdomain', () => {
    expect(getFaviconUrl('blog.example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=blog.example.com&sz=32'
    );
  });
});
