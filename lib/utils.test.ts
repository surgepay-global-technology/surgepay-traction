import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatNumber, shortenAddress, safeFetch } from '@/lib/utils';

describe('formatNumber', () => {
  it('formats integers with grouping', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('shortenAddress', () => {
  const full = `0x${'a'.repeat(40)}`;

  it('shortens a 42-char hex address', () => {
    expect(shortenAddress(full, 4)).toBe('0xaaaa...aaaa');
  });
});

function mockResponse(partial: {
  ok: boolean;
  status: number;
  contentType: string;
  jsonBody?: unknown;
  textBody?: string;
}): Response {
  const headers = {
    get(name: string) {
      if (name.toLowerCase() === 'content-type') return partial.contentType;
      return null;
    },
  };
  return {
    ok: partial.ok,
    status: partial.status,
    headers: headers as Headers,
    json: async () => partial.jsonBody ?? {},
    text: async () => partial.textBody ?? '',
  } as Response;
}

describe('safeFetch', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns parsed JSON when ok and content-type is application/json', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        contentType: 'application/json; charset=utf-8',
        jsonBody: { data: { x: 1 } },
      })
    );

    const result = await safeFetch<{ x: number }>('https://example.com/api');
    expect(result).toEqual({ data: { x: 1 } });
  });

  it('throws with API error message when not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 503,
        contentType: 'application/json',
        jsonBody: { error: 'Supabase not configured' },
      })
    );

    await expect(safeFetch('https://example.com/api')).rejects.toThrow('Supabase not configured');
  });

  it('throws on HTML response instead of JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        contentType: 'text/html',
        textBody: '<!DOCTYPE html><html>',
      })
    );

    await expect(safeFetch('https://example.com/api')).rejects.toThrow(/HTML error page/);
  });

  it('throws on non-JSON non-HTML body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        contentType: 'text/plain',
        textBody: 'plain text error',
      })
    );

    await expect(safeFetch('https://example.com/api')).rejects.toThrow(/Unexpected response/);
  });
});
