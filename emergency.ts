export interface EmergencyDetection {
  id: string;
  original_text: string;
  dialect: string;
  is_emergency: boolean;
  category: string;
  severity: string;
  confidence: number;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  created_at: string;
}

export interface ClassificationResult {
  is_emergency: boolean;
  category: string;
  severity: string;
  confidence: number;
  dialect: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
}
