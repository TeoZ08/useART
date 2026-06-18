export function hasNoErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length === 0;
}
