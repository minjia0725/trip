# GitHub 部署指南

這個指南會教你如何將東京之旅行程規劃器部署到 GitHub Pages。

## 📋 部署選項

### 選項 1: GitHub Pages（免費，最簡單）

1. **推送程式碼到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用戶名/tokyo-trip.git
   git push -u origin main
   ```

2. **啟用 GitHub Pages**
   - 到你的 GitHub 專案頁面
   - 點擊 **Settings** > **Pages**
   - 在 **Source** 選擇 **GitHub Actions**

3. **建立 GitHub Actions 工作流程**
   - 我已經為你準備好了 `.github/workflows/deploy.yml`
   - 如果沒有，請參考下面的範例

4. **設定環境變數（如果使用 Supabase）**
   - 到 **Settings** > **Secrets and variables** > **Actions**
   - 新增以下 Secrets：
     - `VITE_SUPABASE_URL`: 你的 Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: 你的 Supabase anon key

### 選項 2: Vercel（推薦，更簡單）

1. **推送程式碼到 GitHub**（同上）

2. **連接到 Vercel**
   - 前往 [vercel.com](https://vercel.com)
   - 使用 GitHub 帳號登入
   - 點擊 **New Project**
   - 選擇你的 `tokyo-trip` 專案
   - 在 **Environment Variables** 中新增（如果使用 Supabase）：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - 點擊 **Deploy**

3. **完成！**
   - Vercel 會自動部署，並提供一個網址
   - 之後每次 push 到 GitHub，Vercel 會自動重新部署

### 選項 3: Netlify（也很簡單）

1. **推送程式碼到 GitHub**（同上）

2. **連接到 Netlify**
   - 前往 [netlify.com](https://netlify.com)
   - 使用 GitHub 帳號登入
   - 點擊 **Add new site** > **Import an existing project**
   - 選擇你的 `tokyo-trip` 專案
   - 設定：
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - 在 **Environment variables** 中新增（如果使用 Supabase）：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - 點擊 **Deploy site**

## 🔒 安全性注意事項

### Supabase 公開金鑰（Anon Key）

**重要：** Supabase 的 `anon key` 是**設計來公開使用**的，可以安全地放在前端程式碼中。

- Supabase 使用 **Row Level Security (RLS)** 來保護資料
- 即使有人看到你的 anon key，也無法存取你的資料（因為我們設定了 RLS 政策）
- 如果你擔心，可以在 Supabase Dashboard 中設定更嚴格的 RLS 政策

### 環境變數

- **不要**把 `.env` 檔案上傳到 GitHub（已經在 `.gitignore` 中）
- 使用 GitHub Secrets、Vercel Environment Variables 或 Netlify Environment Variables 來設定
- 本地開發時，複製 `ENV_TEMPLATE.txt` 為 `.env` 並填入你的值

## 📝 部署前檢查清單

- [ ] 確認 `.env` 檔案在 `.gitignore` 中（已經設定好了）
- [ ] 確認所有敏感資訊都不會上傳到 GitHub
- [ ] 如果使用 Supabase，確認已經設定好資料表和 RLS 政策
- [ ] 測試本地建置：`npm run build`
- [ ] 確認 `vite.config.js` 中的 `base` 設定正確（如果部署到子路徑）

## 🚀 快速部署（Vercel 推薦）

最簡單的方式：

1. Push 到 GitHub
2. 到 [vercel.com](https://vercel.com) 登入
3. 點擊 **New Project** > 選擇專案
4. 新增環境變數（如果使用 Supabase）
5. 點擊 **Deploy**

完成！你的網站會在幾分鐘內上線。
