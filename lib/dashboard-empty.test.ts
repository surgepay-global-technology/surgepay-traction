import { describe, it, expect } from 'vitest';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';

describe('isBackendUnavailableError', () => {
  it('detects 503 in message', () => {
    expect(isBackendUnavailableError('Request failed with status 503')).toBe(true);
  });

  it('detects supabase (case insensitive)', () => {
    expect(isBackendUnavailableError('Supabase URL missing')).toBe(true);
  });

  it('detects not configured', () => {
    expect(isBackendUnavailableError('Service not configured')).toBe(true);
  });

  it('detects alchemy not configured', () => {
    expect(isBackendUnavailableError('Alchemy not configured. Set token')).toBe(true);
  });

  it('returns false for generic network errors', () => {
    expect(isBackendUnavailableError('Network request failed')).toBe(false);
  });
});
