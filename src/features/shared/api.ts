export function ensureNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
