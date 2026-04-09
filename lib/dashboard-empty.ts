/**
 * Classify fetch errors so the UI can show audience-appropriate copy (no raw env strings on screen).
 */
export function isBackendUnavailableError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    message.includes('503') ||
    m.includes('supabase') ||
    m.includes('not configured') ||
    m.includes('alchemy not configured')
  );
}
