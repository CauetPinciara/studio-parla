export const SUPERADMIN_EMAIL = "cauetpinciara@gmail.com" as const;

export function isSuperadminEmail(
  email: string | null | undefined,
): boolean {
  return email?.trim().toLowerCase() === SUPERADMIN_EMAIL;
}
