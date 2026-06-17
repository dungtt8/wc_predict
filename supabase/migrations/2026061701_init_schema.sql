create extension if not exists pgcrypto;

create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  owner_nickname text not null,
  created_at timestamptz not null default now()
);

create table room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  nickname text not null,
  display_tag text not null,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  api_source_id bigint not null unique,
  name text not null,
  fifa_code text not null,
  flag_url text
);

create table fixtures (
  id uuid primary key default gen_random_uuid(),
  api_source_id bigint not null unique,
  stage text not null,
  kickoff_at timestamptz not null,
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  status text not null
);

create table fixture_results (
  fixture_id uuid primary key references fixtures(id) on delete cascade,
  home_score int not null,
  away_score int not null,
  finalized_at timestamptz not null
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  fixture_id uuid not null references fixtures(id) on delete cascade,
  member_id uuid not null references room_members(id) on delete cascade,
  pred_home int not null check (pred_home >= 0),
  pred_away int not null check (pred_away >= 0),
  submitted_at timestamptz not null default now(),
  locked_at timestamptz,
  unique (room_id, fixture_id, member_id)
);

create table prediction_points (
  prediction_id uuid primary key references predictions(id) on delete cascade,
  points int not null check (points in (0, 1, 3)),
  exact_hit boolean not null,
  outcome_hit boolean not null,
  calculated_at timestamptz not null default now()
);

create table room_rankings_snapshot (
  room_id uuid not null references rooms(id) on delete cascade,
  member_id uuid not null references room_members(id) on delete cascade,
  total_points int not null default 0,
  exact_hits int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (room_id, member_id)
);

create index idx_rankings_room_score on room_rankings_snapshot (room_id, total_points desc, exact_hits desc);
create index idx_predictions_room_fixture on predictions (room_id, fixture_id);
