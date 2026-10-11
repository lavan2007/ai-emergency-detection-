import type { ClassificationResult } from '@/types/emergency';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function classifyEmergency(
  text: string,
  latitude?: number | null,
  longitude?: number | null,
): Promise<ClassificationResult> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/classify-emergency`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, latitude, longitude }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Classification failed (${response.status})`);
  }

  const data = await response.json();

  if (typeof data.is_emergency !== 'boolean' || typeof data.category !== 'string') {
    throw new Error('Received invalid response from classification service');
  }

  return data as ClassificationResult;
}
