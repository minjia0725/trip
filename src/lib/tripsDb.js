/**
 * 行程資料庫 API（Supabase）
 * 登入後從這裡讀寫行程，未登入時由頁面使用 localStorage。
 */
import { supabase, isSupabaseEnabled } from './supabase';

function rowToTrip(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name ?? '未命名旅程',
    date: row.date ?? '未設定',
    days: row.days ?? 0,
    createdAt: row.created_at,
    data: Array.isArray(row.data) ? row.data : [],
    notes: row.notes ?? '',
  };
}

/**
 * 取得目前使用者的所有行程（依建立時間新到舊）
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function getTrips() {
  if (!isSupabaseEnabled || !supabase) {
    return { data: [], error: new Error('Supabase 未設定') };
  }
  const { data: rows, error } = await supabase
    .from('trips')
    .select('id, user_id, name, date, days, data, notes, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error };
  return {
    data: (rows ?? []).map(rowToTrip),
    error: null,
  };
}

/**
 * 依 id 取得單一行程
 * @param {string} tripId - UUID
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function getTripById(tripId) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: new Error('Supabase 未設定') };
  }
  const { data: row, error } = await supabase
    .from('trips')
    .select('id, user_id, name, date, days, data, notes, created_at, updated_at')
    .eq('id', tripId)
    .single();
  if (error) return { data: null, error };
  return { data: rowToTrip(row), error: null };
}

/**
 * 新增行程（user_id 由 Supabase RLS 從 auth.uid() 取得，需在 insert 時帶入）
 * @param {string} userId - auth.users.id
 * @param {{ name: string, date?: string, days?: number, data?: array, notes?: string }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function createTrip(userId, payload) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: new Error('Supabase 未設定') };
  }
  const { data: row, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      name: payload.name ?? '未命名旅程',
      date: payload.date ?? '未設定',
      days: payload.days ?? 0,
      data: payload.data ?? [],
      notes: payload.notes ?? '',
    })
    .select('id, user_id, name, date, days, data, notes, created_at, updated_at')
    .single();
  if (error) return { data: null, error };
  return { data: rowToTrip(row), error: null };
}

/**
 * 更新行程（部分欄位）
 * @param {string} tripId - UUID
 * @param {{ name?: string, date?: string, days?: number, data?: array, notes?: string }} payload
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function updateTrip(tripId, payload) {
  if (!isSupabaseEnabled || !supabase) {
    return { data: null, error: new Error('Supabase 未設定') };
  }
  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.date !== undefined) updates.date = payload.date;
  if (payload.days !== undefined) updates.days = payload.days;
  if (payload.data !== undefined) updates.data = payload.data;
  if (payload.notes !== undefined) updates.notes = payload.notes;
  if (Object.keys(updates).length === 0) {
    return { data: null, error: null };
  }
  const { data: row, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select('id, user_id, name, date, days, data, notes, created_at, updated_at')
    .single();
  if (error) return { data: null, error };
  return { data: rowToTrip(row), error: null };
}

/**
 * 刪除行程
 * @param {string} tripId - UUID
 * @returns {Promise<{ error: Error | null }>}
 */
export async function deleteTrip(tripId) {
  if (!isSupabaseEnabled || !supabase) {
    return { error: new Error('Supabase 未設定') };
  }
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  return { error };
}
