alter table rooms enable row level security;
alter table room_members enable row level security;
alter table predictions enable row level security;
alter table room_rankings_snapshot enable row level security;
alter table prediction_points enable row level security;

create policy "members can read own rooms"
on rooms
for select
using (
  exists (
    select 1
    from room_members rm
    where rm.room_id = rooms.id
      and rm.id::text = auth.uid()::text
  )
);

create policy "members can read room members"
on room_members
for select
using (
  exists (
    select 1
    from room_members rm
    where rm.room_id = room_members.room_id
      and rm.id::text = auth.uid()::text
  )
);

create policy "members can write own predictions"
on predictions
for all
using (
  exists (
    select 1
    from room_members rm
    where rm.id = predictions.member_id
      and rm.room_id = predictions.room_id
      and rm.id::text = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from room_members rm
    where rm.id = predictions.member_id
      and rm.room_id = predictions.room_id
      and rm.id::text = auth.uid()::text
  )
);

create policy "members can read room rankings"
on room_rankings_snapshot
for select
using (
  exists (
    select 1
    from room_members rm
    where rm.room_id = room_rankings_snapshot.room_id
      and rm.id::text = auth.uid()::text
  )
);

revoke all on prediction_points from anon, authenticated;
revoke all on room_rankings_snapshot from anon;
grant select on room_rankings_snapshot to authenticated;
