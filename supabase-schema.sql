-- Supabase 行程資料表（依使用者區分）
-- 請在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 行程表：每個使用者只會看到自己的行程
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '未命名旅程',
  date TEXT NOT NULL DEFAULT '未設定',
  days INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引：依使用者與建立時間查詢
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_created ON trips(user_id, created_at DESC);

-- 啟用 RLS：只允許讀寫自己的資料
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 先移除舊的 policy（重複執行時才不會報錯）
DROP POLICY IF EXISTS "Users can read own trips" ON trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;

-- 只能讀取自己的行程
CREATE POLICY "Users can read own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

-- 只能新增自己的行程（並強制 user_id = 目前使用者）
CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 只能更新自己的行程
CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 只能刪除自己的行程
CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- 可選：更新 updated_at 的 trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trips_updated_at ON trips;
CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
