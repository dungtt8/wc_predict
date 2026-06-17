insert into rooms (id, code, name, owner_nickname)
values ('00000000-0000-0000-0000-000000000001', 'ABC123', 'Demo Room', 'Host')
on conflict (id) do nothing;

insert into room_members (id, room_id, nickname, display_tag)
values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Host', 'Host#001'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Guest', 'Guest#001')
on conflict (id) do nothing;
