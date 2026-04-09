export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'reddit';
export type ThreatCategory = 'scam' | 'financial_fraud' | 'phishing' | 'romance_scam' | 'impersonation' | 'harassment' | 'spam' | 'bot_network' | 'job_scam' | 'unknown';

export interface ProfileMetadata {
  accountAge: number;
  followerCount: number;
  followingCount: number;
  postCount: number;
  averagePostsPerDay: number;
  hasProfilePicture: boolean;
  bio: string;
  verified: boolean;
  location: string;
  website: string;
  engagementRate: number;
  joinDate: string;
}

export interface Indicator {
  type: 'suspicious' | 'warning' | 'safe';
  category: string;
  description: string;
  weight: number;
}

export interface OSINTSource {
  name: string;
  icon: string;
  found: boolean;
  data: string;
  confidence: number;
  url?: string;
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  botSimilarity: number;
  description: string;
  detected: boolean;
}

export interface NetworkConnection {
  id: string;
  username: string;
  platform: Platform;
  riskScore: number;
  riskLevel: RiskLevel;
  connectionType: 'follower' | 'following' | 'mutual' | 'mentioned' | 'coordinated';
  sharedPatterns: string[];
}

export interface AnalysisBreakdown {
  usernameScore: number;
  accountAgeScore: number;
  activityScore: number;
  networkScore: number;
  contentScore: number;
  consistencyScore: number;
  darkWebScore: number;
}

export interface AnalysisData {
  breakdown: AnalysisBreakdown;
  indicators: Indicator[];
  osintSources: OSINTSource[];
  connections: NetworkConnection[];
  metadata: ProfileMetadata;
  behaviorPatterns: BehaviorPattern[];
  threatCategories: ThreatCategory[];
  linguisticAnalysis: LinguisticAnalysis;
  geolocationRisk: GeolocationRisk;
  summary: string;
}

export interface LinguisticAnalysis {
  botProbability: number;
  templateUsage: number;
  sentimentScore: number;
  spamKeywords: string[];
  languageConsistency: number;
}

export interface GeolocationRisk {
  flaggedRegions: string[];
  vpnDetected: boolean;
  proxyDetected: boolean;
  locationConsistency: number;
  riskScore: number;
}

export interface Investigation {
  id: string;
  username: string;
  platform: Platform;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'pending' | 'complete' | 'flagged';
  analysisData: AnalysisData;
  createdAt: string;
  updatedAt: string;
}

export interface ThreatActor {
  id: string;
  username: string;
  platform: Platform;
  riskScore: number;
  riskLevel: RiskLevel;
  threatCategory: ThreatCategory;
  tags: string[];
  description: string;
  reportedCount: number;
  confirmed: boolean;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  username: string;
  platform: Platform;
  riskScore: number;
  riskLevel: RiskLevel;
  isTarget: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

export interface CommunityReport {
  id: string;
  username: string;
  platform: Platform;
  category: ThreatCategory;
  description: string;
  evidenceUrls: string[];
  status: 'pending' | 'verified' | 'dismissed';
  upvotes: number;
  createdAt: string;
}

export interface DashboardStats {
  totalInvestigations: number;
  highRiskDetected: number;
  threatsNeutralized: number;
  networksAnalyzed: number;
  recentTrend: number;
}

export type Page = 'dashboard' | 'analyzer' | 'network' | 'investigations' | 'threat-intel' | 'reports';