export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  UNKNOWN = 'UNKNOWN'
}

export interface JournalEntry {
  id: string;
  timestamp: number; // Unix timestamp
  foodName: string;
  notes: string;
  status: 'SAFE' | 'UNSAFE' | 'NEUTRAL';
}

export interface UserProfile {
  id: string; // Unique ID (Google sub or Guest ID)
  authType: 'GUEST' | 'GOOGLE';
  email?: string;
  name: string;
  avatar?: string; // New field for digital avatar
  conditions: string[]; 
  allergies: string[]; 
  generatedAvoidanceList: string[]; // AI inferred avoidances
  customAvoidanceList: string[]; // User manually marked as unsafe
  safeFoodList: string[]; // User manually marked as safe
  goals: string; 
  isOnboarded: boolean;
  theme: 'light' | 'dark';
  journal: JournalEntry[];
}

export interface NutrientRisk {
  name: string;
  amount: string; 
  riskImpact: number; 
  reason: string;
}

export interface AnalysisResult {
  foodName: string;
  canEat: boolean;
  threatLevel: ThreatLevel;
  shortSummary: string;
  detailedReasoning: string;
  riskyIngredients: string[];
  nutrients: NutrientRisk[];
}

export enum AppView {
  INTRO = 'INTRO',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  SCANNING = 'SCANNING',
  RESULT = 'RESULT',
  LOADING = 'LOADING',
  MY_DIET = 'MY_DIET',
  JOURNAL = 'JOURNAL',
  SETTINGS = 'SETTINGS'
}