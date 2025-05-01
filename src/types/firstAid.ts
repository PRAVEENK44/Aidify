
export interface Step {
  id: number;
  content: string;
  important?: boolean;
  duration?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
}

export interface FirstAidInstructionsProps {
  injuryType: string;
  severity: "low" | "medium" | "high";
  location?: string;
  bloodLevel?: "none" | "minimal" | "moderate" | "severe";
  foreignObjects?: boolean;
  steps: Step[];
  warning?: string;
  note?: string;
  sources?: string[];
  estimatedTime?: string;
}

export interface InjuryDetectionResult {
  injuryType: string;
  probability: number;
  details: {
    severity: "low" | "medium" | "high";
    location?: string;
    bloodLevel?: "none" | "minimal" | "moderate" | "severe";
    foreignObjects?: boolean;
  }
}

// This represents the pathway API response structure
export interface PathwayApiResponse {
  results: InjuryDetectionResult[];
  vectorSearchDetails: {
    similarDocuments: Array<{
      title: string;
      similarity: number;
    }>;
    contextChunks: number;
  };
  firstAidInstructions: FirstAidInstructionsProps;
  processingTime: number;
}

export type InjuryTypeCategory = 
  | "burn" 
  | "cut" 
  | "fracture" 
  | "sprain" 
  | "cardiac" 
  | "stroke" 
  | "choking" 
  | "bleeding" 
  | "allergic" 
  | "head" 
  | "eye" 
  | "poisoning"
  | "other";

export interface EnhancedInjuryDetection extends InjuryDetectionResult {
  category: InjuryTypeCategory;
  symptoms: string[];
  urgencyLevel: 1 | 2 | 3 | 4 | 5; // 5 being most urgent
  commonCauses: string[];
  imageSignifiers: string[]; // Visual cues that helped identify the injury
}

// For video tutorials and audio guidance
export interface MediaResource {
  id: string;
  type: "video" | "audio";
  url: string;
  title: string;
  duration: number; // in seconds
  thumbnail?: string; // for videos
  stepId?: number; // associated step
}

// For Pathway RAG system simulation
export interface PathwaySystemStatus {
  status: "online" | "degraded" | "offline";
  indexedDocuments: number;
  activeConnections: number;
  averageResponseTime: number; // in ms
  lastUpdated: Date;
  vectorDatabaseSize: number; // in MB
}

// Vision AI detection details - used to store and display detection metrics
export interface DetectionMetrics {
  redDominance?: number;
  bloodMentions?: number;
  hasFace?: boolean;
  violenceScore?: number;
  confidence?: number;
  geminiDetails?: {
    detectedObjects?: string[];
    detectedColors?: string[];
    injuryProbability?: number;
    detectedKeywords?: string[];
  };
}

// Custom Progress component props extension for Tailwind styling
export interface CustomProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}
