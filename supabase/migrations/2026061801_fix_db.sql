-- 1. Xóa các policy cũ bị lỗi đệ quy
DROP POLICY IF EXISTS "members can read room members" ON room_members;
DROP POLICY IF EXISTS "members can read room rankings" ON room_rankings_snapshot;

-- 2. Tạo hàm helper để kiểm tra quyền không đệ quy
CREATE OR REPLACE FUNCTION public.is_member_of_room(target_room_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_members
    WHERE room_id = target_room_id
      AND id::text = auth.uid()::text
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Tạo lại các policy sử dụng hàm helper
CREATE POLICY "members can read room members"
ON room_members
FOR SELECT
USING (public.is_member_of_room(room_id));

CREATE POLICY "members can read room rankings"
ON room_rankings_snapshot
FOR SELECT
USING (public.is_member_of_room(room_id));