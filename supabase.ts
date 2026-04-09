import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveInvestigation(data: {
  username: string;
  platform: string;
  riskScore: number;
  riskLevel: string;
  analysisData: object;
  metadata: object;
}) {
  const { data: result, error } = await supabase
    .from('investigations')
    .insert({
      username: data.username,
      platform: data.platform,
      risk_score: data.riskScore,
      risk_level: data.riskLevel,
      analysis_data: data.analysisData,
      metadata: data.metadata,
      status: 'complete',
    })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function getInvestigations(limit = 50) {
  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getThreatActors() {
  const { data, error } = await supabase
    .from('threat_actors')
    .select('*')
    .order('risk_score', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCommunityReports() {
  const { data, error } = await supabase
    .from('community_reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function submitCommunityReport(report: {
  username: string;
  platform: string;
  category: string;
  description: string;
}) {
  const { data, error } = await supabase
    .from('community_reports')
    .insert(report)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upvoteReport(id: string, currentUpvotes: number) {
  const { error } = await supabase
    .from('community_reports')
    .update({ upvotes: currentUpvotes + 1 })
    .eq('id', id);
  if (error) throw error;
}
