import { MenuScanResult } from './types';

export function parseJsonResponse(text: string): MenuScanResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from provider response. Try a clearer photo.');
  }
  try {
    return JSON.parse(jsonMatch[0]) as MenuScanResult;
  } catch {
    throw new Error('Provider returned malformed JSON. Try a clearer photo.');
  }
}
