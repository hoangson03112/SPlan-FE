/**
 * The backend has no avatar storage, so we derive a stable placeholder
 * avatar image from the member's name/email via a free initials-avatar service.
 */
export function getAvatarUrl(nameOrEmail: string): string {
  const seed = encodeURIComponent(nameOrEmail || "?");
  return `https://ui-avatars.com/api/?name=${seed}&background=8C6B4F&color=fff&size=128`;
}
