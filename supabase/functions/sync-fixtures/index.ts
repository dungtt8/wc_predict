import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { fetchWithRetry, mapFixturePayload } from "../_shared/apiFootball.ts";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const response = await fetchWithRetry(
    "https://v3.football.api-sports.io/fixtures?league=1&season=2026",
    { "x-apisports-key": Deno.env.get("API_FOOTBALL_KEY")! },
  );

  const payload = await response.json();
  const fixtures = payload.response.map(mapFixturePayload);

  for (const fixture of fixtures) {
    await supabase.from("teams").upsert(
      [
        {
          api_source_id: fixture.homeTeamApiId,
          name: fixture.homeTeamName,
          fifa_code: String(fixture.homeTeamApiId),
        },
        {
          api_source_id: fixture.awayTeamApiId,
          name: fixture.awayTeamName,
          fifa_code: String(fixture.awayTeamApiId),
        },
      ],
      { onConflict: "api_source_id" },
    );

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id,api_source_id")
      .in("api_source_id", [fixture.homeTeamApiId, fixture.awayTeamApiId]);

    if (teamsError || !teams || teams.length !== 2) {
      throw teamsError ?? new Error("Failed to resolve synced teams");
    }

    const homeTeam = teams.find((team) => team.api_source_id === fixture.homeTeamApiId);
    const awayTeam = teams.find((team) => team.api_source_id === fixture.awayTeamApiId);

    if (!homeTeam || !awayTeam) {
      throw new Error("Missing home or away team after upsert");
    }

    const { data: fixtureRow, error: fixtureError } = await supabase
      .from("fixtures")
      .upsert(
        {
          api_source_id: fixture.apiSourceId,
          stage: fixture.stage,
          kickoff_at: fixture.kickoffAt,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          status: fixture.status,
        },
        { onConflict: "api_source_id" },
      )
      .select("id")
      .single();

    if (fixtureError || !fixtureRow) {
      throw fixtureError ?? new Error("Failed to upsert fixture");
    }

    if (fixture.homeScore !== null && fixture.awayScore !== null) {
      await supabase.from("fixture_results").upsert(
        {
          fixture_id: fixtureRow.id,
          home_score: fixture.homeScore,
          away_score: fixture.awayScore,
          finalized_at: new Date().toISOString(),
        },
        { onConflict: "fixture_id" },
      );
    }
  }

  return new Response(JSON.stringify({ synced: fixtures.length }), {
    headers: { "content-type": "application/json" },
  });
});
