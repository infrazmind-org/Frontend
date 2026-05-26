export type ApiFetchOptions = {
  method?: string;
  token?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
};

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/** Use for plain `fetch` calls (login/register, public catalog). */
export function apiUrl(path: string) {
  if (!path.startsWith('/')) return API_BASE ? `${API_BASE}/${path}` : `/${path}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}

function joinUrl(path: string) {
  return apiUrl(path);
}

export function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(joinUrl(path), {
    method: options.method || 'GET',
    headers,
    body: options.body ?? undefined,
  });
}

/** Parse FastAPI `detail` (string, object, or validation list) and legacy `error` string. */
export function formatFastApiDetail(data: unknown): string {
  if (data && typeof data === 'object' && 'detail' in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d.length > 0) {
      const first = d[0];
      if (first && typeof first === 'object' && 'msg' in first) {
        return String((first as { msg: unknown }).msg);
      }
      try {
        return JSON.stringify(d);
      } catch {
        return 'Request failed';
      }
    }
    if (d && typeof d === 'object') {
      try {
        return JSON.stringify(d);
      } catch {
        return 'Request failed';
      }
    }
  }
  if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string') {
    return (data as { error: string }).error;
  }
  return 'Request failed';
}
