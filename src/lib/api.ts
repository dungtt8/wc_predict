import { supabase } from './supabaseClient';

export const getFixtures = async () => {
  const { data, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:teams!home_team_id(name),
      away_team:teams!away_team_id(name),
      fixture_results(home_score, away_score)
    `)
    .order('kickoff_at', { ascending: true });

  if (error) throw error;
  return data;
};