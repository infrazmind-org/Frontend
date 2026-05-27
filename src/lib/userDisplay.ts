export function userInitials(user: {
  email: string;
  first_name?: string;
  last_name?: string;
}): string {
  const f = (user.first_name ?? '').trim();
  const l = (user.last_name ?? '').trim();
  if (f && l) return `${f[0]!}${l[0]!}`.toUpperCase();
  if (f.length >= 2) return f.slice(0, 2).toUpperCase();
  if (f.length === 1) return f.toUpperCase();
  const local = user.email.split('@')[0] ?? 'U';
  return local.slice(0, 2).toUpperCase();
}

export function userDisplayName(user: {
  email: string;
  first_name?: string;
  last_name?: string;
}): string {
  const full = [user.first_name, user.last_name].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  return full || user.email;
}
