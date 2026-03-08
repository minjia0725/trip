import { createClient } from '@supabase/supabase-js'

// 這些值需要從 Supabase 專案設定中取得
// 請到 https://supabase.com 註冊並建立專案後，在專案設定中找到這些值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 如果沒有設定環境變數，使用 localStorage 作為備用
let supabase = null
let isSupabaseEnabled = false

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    isSupabaseEnabled = true
  } catch (error) {
    console.error('⚠️ Supabase 初始化失敗:', error)
    console.warn('⚠️ 將使用 localStorage 作為備用儲存')
  }
} else {
  console.warn('⚠️ Supabase 未設定，將使用 localStorage 作為備用儲存')
}

export { supabase, isSupabaseEnabled }
