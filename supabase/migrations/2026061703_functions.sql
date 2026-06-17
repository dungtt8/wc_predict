create or replace function score_prediction_row(
  pred_home int,
  pred_away int,
  actual_home int,
  actual_away int
)
returns table(points int, exact_hit boolean, outcome_hit boolean)
language sql
as $$
  select
    case
      when pred_home = actual_home and pred_away = actual_away then 3
      when sign(pred_home - pred_away) = sign(actual_home - actual_away) then 1
      when pred_home = pred_away and actual_home = actual_away then 1
      else 0
    end as points,
    (pred_home = actual_home and pred_away = actual_away) as exact_hit,
    (
      sign(pred_home - pred_away) = sign(actual_home - actual_away)
      or (pred_home = pred_away and actual_home = actual_away)
    ) as outcome_hit;
$$;

create or replace function enforce_prediction_lock()
returns trigger
language plpgsql
as $$
declare
  v_kickoff timestamptz;
begin
  select kickoff_at into v_kickoff from fixtures where id = new.fixture_id;
  if now() >= v_kickoff then
    raise exception 'Prediction is locked because kickoff has started';
  end if;

  new.locked_at := v_kickoff;
  return new;
end;
$$;

drop trigger if exists trg_prediction_lock on predictions;
create trigger trg_prediction_lock
before insert or update on predictions
for each row
execute function enforce_prediction_lock();

create or replace function recompute_room_rankings(p_room_id uuid)
returns void
language sql
as $$
  insert into room_rankings_snapshot (room_id, member_id, total_points, exact_hits, updated_at)
  select
    p.room_id,
    p.member_id,
    coalesce(sum(pp.points), 0) as total_points,
    coalesce(sum(case when pp.exact_hit then 1 else 0 end), 0) as exact_hits,
    now() as updated_at
  from predictions p
  left join prediction_points pp on pp.prediction_id = p.id
  where p.room_id = p_room_id
  group by p.room_id, p.member_id
  on conflict (room_id, member_id)
  do update set
    total_points = excluded.total_points,
    exact_hits = excluded.exact_hits,
    updated_at = excluded.updated_at;
$$;
