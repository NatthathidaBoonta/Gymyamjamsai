/**
 * imageUtils.ts — Handle exercise image/GIF display
 * Converts media URLs to proper display format
 */

export function getImageUrl(mediaUrl: string | null | undefined): string {
  if (!mediaUrl) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%2300d4ff" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%230b0d0f" text-anchor="middle" dominant-baseline="middle"%3E📸 No Image%3C/text%3E%3C/svg%3E';
  }

  // If it's already a full URL, return as-is
  if (mediaUrl.startsWith('http')) {
    return mediaUrl;
  }

  // Exercise GIFs ship as static assets in frontend/public/exercises — served by
  // the frontend origin itself, not the backend API. Encode spaces/special chars.
  if (mediaUrl.startsWith('/')) {
    return encodeURI(mediaUrl);
  }

  return encodeURI(`/exercises/${mediaUrl}`);
}

export function isGifFile(mediaUrl: string | null | undefined): boolean {
  if (!mediaUrl) return false;
  return mediaUrl.toLowerCase().endsWith('.gif');
}

export function isMp4File(mediaUrl: string | null | undefined): boolean {
  if (!mediaUrl) return false;
  return mediaUrl.toLowerCase().endsWith('.mp4');
}

export function getMediaType(mediaUrl: string | null | undefined): 'gif' | 'mp4' | 'image' | 'unknown' {
  if (!mediaUrl) return 'unknown';

  const lower = mediaUrl.toLowerCase();
  if (lower.endsWith('.gif')) return 'gif';
  if (lower.endsWith('.mp4')) return 'mp4';
  if (lower.match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'image';
  return 'unknown';
}
