# 東京之旅行程規劃器 🗾

一個現代化的東京行程規劃網站，支援即時編輯、雲端同步，以及美觀的使用者介面。

## ✨ 功能特色

- 📝 **即時編輯**：直接在網頁上編輯行程內容、時間、費用
- ☁️ **雲端同步**：使用 Supabase 後端，資料跨裝置同步（可選）
- 💾 **本地備份**：自動儲存到瀏覽器 localStorage
- 📊 **預算統計**：自動計算日幣與台幣總預算
- 🎨 **現代化 UI**：響應式設計，支援手機與電腦
- 🔗 **連結管理**：為每個行程添加相關連結

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

## ☁️ 設定 Supabase 後端（可選）

如果你想要跨裝置同步資料，可以設定 Supabase 後端。詳細步驟請參考 [supabase-setup.md](./supabase-setup.md)。

**快速設定：**

1. 前往 [supabase.com](https://supabase.com) 註冊並建立專案
2. 在 SQL Editor 執行 `supabase-schema.sql` 中的 SQL
3. 建立 `.env` 檔案並填入你的 Supabase 金鑰：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. 重新啟動開發伺服器

**如果不設定 Supabase**，系統會自動使用 localStorage 儲存資料（僅限單一裝置）。

## 📊 從 Excel 匯入資料

如果你有 Excel 格式的行程表，可以使用 Python 腳本轉換：

```bash
python extract_data_v2.py
```

這會讀取 `../東京3_26 - 3_31.xlsx` 並生成 `src/data.json`。

## 🛠️ 技術棧

- **React 19** - UI 框架
- **Vite** - 建置工具
- **Tailwind CSS** - 樣式框架
- **Supabase** - 後端資料庫（可選）
- **Lucide React** - 圖示庫

## 🚀 部署到 GitHub

想要把這個專案放到 GitHub 並部署到線上嗎？請參考 [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) 的詳細說明。

**快速部署（推薦）：**
1. Push 程式碼到 GitHub
2. 到 [Vercel](https://vercel.com) 或 [Netlify](https://netlify.com) 連接你的 GitHub 專案
3. 設定環境變數（如果使用 Supabase）
4. 完成！網站自動上線

## 📝 授權

MIT License
