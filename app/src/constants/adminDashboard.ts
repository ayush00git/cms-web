// adminDashboardFor maps an admin position (XEN_* / AE_* / JE_*) to its
// dashboard route; '/' means the position is unknown.
export function adminDashboardFor(position: string): string {
  if (position.startsWith('XEN')) return '/admin/xen';
  if (position.startsWith('AE'))  return '/admin/ae';
  if (position.startsWith('JE'))  return '/admin/je';
  return '/';
}
