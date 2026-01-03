export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  UNKNOWN = 'UNKNOWN'
}

export interface UserProfile {
  id: string; // Unique ID (Google sub or Guest ID)
  authType: 'GUEST' | 'GOOGLE';
  email?: string;
  name: string;
  conditions: string[]; // e.g., "Celiac", "IBS", "Lactose Intolerance"
  allergies: string[]; // e.g., "Peanuts", "Shellfish"
  generatedAvoidanceList: string[]; // AI inferred avoidances based on conditions
  customAvoidanceList: string[]; // User manually added avoidances
  goals: string; // e.g., "Reduce inflammation", "Avoid bloating"
  isOnboarded: boolean;
}

export interface NutrientRisk {
  name: string;
  amount: string; // e.g. "12g"
  riskImpact: number; // 0-100, how much it contributes to the risk
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
  MY_DIET = 'MY_DIET'
}