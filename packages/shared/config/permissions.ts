import type { MemberRole, Permissions } from '../types/user';

// ═══════════════════════════════════════════════════════════════
// Default Permissions per Role
// Used when tenant_members.permissions is NULL
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_PERMISSIONS: Record<Exclude<MemberRole, 'custom'>, Permissions> = {
  owner: {
    kb:        { read: true, write: true, delete: true, manage: true },
    tickets:   { read: true, write: true, assign: true, delete: true },
    ai:        { chat: true, configure: true },
    logs:      { view: true, export: true },
    team:      { invite: true, remove: true, change_role: true },
    billing:   { view: true, manage: true },
    settings:  { view: true, edit: true },
    floating_assistant: { use: true, configure: true },
  },
  admin: {
    kb:        { read: true, write: true, delete: true, manage: true },
    tickets:   { read: true, write: true, assign: true, delete: false },
    ai:        { chat: true, configure: true },
    logs:      { view: true, export: true },
    team:      { invite: true, remove: false, change_role: false },
    billing:   { view: true, manage: false },
    settings:  { view: true, edit: true },
    floating_assistant: { use: true, configure: true },
  },
  agent: {
    kb:        { read: true, write: true, delete: false, manage: false },
    tickets:   { read: true, write: true, assign: false, delete: false },
    ai:        { chat: true, configure: false },
    logs:      { view: false, export: false },
    team:      { invite: false, remove: false, change_role: false },
    billing:   { view: false, manage: false },
    settings:  { view: true, edit: false },
    floating_assistant: { use: true, configure: false },
  },
  viewer: {
    kb:        { read: true, write: false, delete: false, manage: false },
    tickets:   { read: true, write: false, assign: false, delete: false },
    ai:        { chat: false, configure: false },
    logs:      { view: false, export: false },
    team:      { invite: false, remove: false, change_role: false },
    billing:   { view: false, manage: false },
    settings:  { view: true, edit: false },
    floating_assistant: { use: false, configure: false },
  },
  billing: {
    kb:        { read: false, write: false, delete: false, manage: false },
    tickets:   { read: false, write: false, assign: false, delete: false },
    ai:        { chat: false, configure: false },
    logs:      { view: false, export: false },
    team:      { invite: false, remove: false, change_role: false },
    billing:   { view: true, manage: true },
    settings:  { view: true, edit: false },
    floating_assistant: { use: false, configure: false },
  },
};

/**
 * Resolve the effective permissions for a tenant member.
 * If the member has custom permissions (role = 'custom' or override),
 * use those. Otherwise, fall back to the default permissions for the role.
 */
export function resolvePermissions(
  role: MemberRole,
  customPermissions?: Permissions | null
): Permissions {
  if (role === 'custom' && customPermissions) {
    return customPermissions;
  }

  if (customPermissions) {
    // Override: merge custom on top of defaults
    const defaults = DEFAULT_PERMISSIONS[role as Exclude<MemberRole, 'custom'>];
    if (!defaults) return customPermissions;
    return deepMergePermissions(defaults, customPermissions);
  }

  const defaults = DEFAULT_PERMISSIONS[role as Exclude<MemberRole, 'custom'>];
  if (!defaults) {
    throw new Error(`No default permissions for role: ${role}`);
  }
  return defaults;
}

/**
 * Check if a member has a specific permission.
 */
export function hasPermission(
  permissions: Permissions,
  resource: keyof Permissions,
  action: string
): boolean {
  const resourcePerms = permissions[resource];
  if (!resourcePerms) return false;
  return (resourcePerms as unknown as Record<string, boolean>)[action] === true;
}

function deepMergePermissions(
  base: Permissions,
  override: Partial<Permissions>
): Permissions {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof Permissions)[]) {
    if (override[key]) {
      result[key] = { ...base[key], ...override[key] } as never;
    }
  }
  return result;
}
