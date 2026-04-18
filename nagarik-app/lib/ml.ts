const ML_URL = process.env.EXPO_PUBLIC_ML_URL || 'http://localhost:8000';

interface AnalyzePayload {
  image_url: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
}

interface AnalyzeResult {
  accepted: boolean;
  severity?: number;
  reason?: string;
}

export async function analyzeReport(payload: AnalyzePayload): Promise<AnalyzeResult> {
  const response = await fetch(`${ML_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ML service error (${response.status}): ${text}`);
  }

  return response.json();
}
