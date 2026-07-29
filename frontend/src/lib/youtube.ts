/**
 * Converts a YouTube watch URL or short URL to an embed URL.
 * Returns empty string if the URL is not a recognized YouTube format.
 */
export function toYoutubeEmbed(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (!match) return '';
  return `https://www.youtube.com/embed/${match[1]}`;
}
