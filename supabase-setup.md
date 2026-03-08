# Supabase 後端設定指南

這個專案支援使用 Supabase 作為後端資料庫，讓你的行程資料可以跨裝置同步。

## 📋 設定步驟

### 1. 註冊 Supabase 帳號

1. 前往 [https://supabase.com](https://supabase.com)
2. 點擊「Start your project」註冊（可以使用 GitHub 帳號快速註冊）
3. 建立一個新專案（Project）

### 2. 建立資料表

在 Supabase Dashboard 中，點擊左側的 **SQL Editor**，然後執行專案根目錄的 **`supabase-schema.sql`** 完整內容（或複製貼上該檔案的 SQL）。

該腳本會建立 **`trips`** 表，並設定 **Row Level Security (RLS)**，讓每位登入使用者只能讀寫自己的行程。

### 3. 取得 API 金鑰

1. 在 Supabase Dashboard 中，點擊左側的 **Settings** (⚙️)
2. 點擊 **API**
3. 找到以下資訊：
   - **Project URL** (例如: `https://xxxxx.supabase.co`)
   - **anon public** key (一長串字元)

### 4. 設定環境變數

在專案根目錄建立 `.env` 檔案（如果不存在），並填入你的 Supabase 資訊：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**重要：** `.env` 檔案已經在 `.gitignore` 中，不會被上傳到 Git。

### 5. 重新啟動開發伺服器

設定完成後，重新啟動開發伺服器：

```bash
npm run dev
```

## ✅ 驗證設定

設定成功後，你會看到：
- 側邊欄標題旁邊出現 **雲朵圖示** (☁️)
- 當資料同步時，圖示會變成綠色
- 你的行程資料會自動儲存到 Supabase

## 🔄 資料同步

- **登入後**：行程列表與單一行程的讀寫都來自 Supabase，編輯會自動寫回資料庫（約 500ms 防抖）
- **未登入**：仍使用瀏覽器 localStorage，行為與以往相同
- **跨裝置**：登入後在不同裝置開啟網站，會看到同一帳號的行程

## 🆓 免費額度

Supabase 免費方案包含：
- 500 MB 資料庫空間
- 2 GB 頻寬/月
- 50,000 次 API 請求/月

對於個人行程規劃專案來說，這些額度完全足夠！

## 🛠️ 故障排除

### 問題：看不到雲端圖示
- 檢查 `.env` 檔案是否正確設定
- 確認環境變數名稱是 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 重新啟動開發伺服器

### 問題：同步失敗（紅色圖示）
- 檢查 Supabase 專案是否正常運作
- 確認 API 金鑰是否正確
- 檢查瀏覽器控制台是否有錯誤訊息

### 問題：資料沒有同步
- 確認資料表已正確建立
- 檢查 Row Level Security (RLS) 政策是否設定正確

## 📝 不使用 Supabase

如果你不想使用 Supabase，也可以：
- 不設定環境變數，系統會自動使用 localStorage
- 資料仍會正常儲存，只是不會跨裝置同步
