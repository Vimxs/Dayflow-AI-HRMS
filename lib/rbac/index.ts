/**
 * Dayflow HRMS — RBAC permission utilities
 * Architecture doc §3: lib/rbac/
 * Security doc §2 — full implementation in T1.5
 *
 * STUB: Types and constants defined. Guard functions implemented in T1.5.
 */
export type UserRole = "ADMIN" | "EMPLOYEE";

export const ROLES = {
  ADMIN: "ADMIN" as const,
  EMPLOYEE: "EMPLOYEE" as const,
};

/**
 * Check if a role has admin privileges.
 * STUB — full middleware guard implemented in T1.5.
 */
export function isAdmin(role: UserRole): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if the requesting user owns the resource (or is an admin).
 * Used in API routes to enforce ownership — Security doc §2.
 * Full implementation in T1.5.
 */
export function canAccessResource(
  requestingUserId: string,
  resourceOwnerId: string,
  requestingRole: UserRole
): boolean {
  if (isAdmin(requestingRole)) return true;
  return requestingUserId === resourceOwnerId;
}
