const IMAGE_KEY = /(photo|image|picture|selfie|avatar|face)/i;
const BASE64_BODY = /^[A-Za-z0-9+/=\s]+$/;

function base64Mime(b64: string): string {
  if (b64.startsWith('iVBOR')) return 'image/png';
  if (b64.startsWith('R0lGOD')) return 'image/gif';
  if (b64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}

/** `img` src for photo-like fields (data URI, http URL, or bare base64); null otherwise. */
export function imageSrcForField(key: string, value: unknown): string | null {
  if (typeof value !== 'string' || !IMAGE_KEY.test(key)) return null;
  const v = value.trim();
  if (!v) return null;
  if (/^data:image\//i.test(v)) return v;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.length >= 100 && BASE64_BODY.test(v)) {
    const body = v.replace(/\s+/g, '');
    return `data:${base64Mime(body)};base64,${body}`;
  }
  return null;
}

export function isImageField(key: string, value: unknown): boolean {
  return imageSrcForField(key, value) !== null;
}
