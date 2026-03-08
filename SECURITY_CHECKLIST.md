# 上傳前安全檢查清單

推送到 GitHub 前，請確認以下項目，避免個資或金鑰外洩。

---

## 已排除的檔案（.gitignore）

以下檔案**不會**被 git 追蹤，不會上傳：

- `.env`（你的 Supabase URL、anon key、信箱等）
- `.env.local`、`.env.*.local`
- `.env.development`、`.env.production` 等

---

## 檢查方式

### 1. 確認 .env 沒有被加入

在專案資料夾執行：

```bash
git status
```

若列表裡出現 `.env`，**不要** `git add` 它，也不要 commit。

### 2. 確認 .env.example 只有範例

打開 `.env.example`，內容應為：

- `VITE_SUPABASE_URL=https://your-project-id.supabase.co`（不是你的真實網址）
- `VITE_SUPABASE_ANON_KEY=your-anon-key-here`（不是真實 key）
- `VITE_ALLOWED_EMAIL=your-email@example.com`（不是你的真實信箱）

若有真實值，請改回上述佔位再 commit。

### 3. 搜尋是否誤寫入金鑰或專案 ID

在整個專案中搜尋（不要含 node_modules）：

- 你的 Supabase 專案 ID（網址裡 `xxxx.supabase.co` 的 xxxx）
- 你的真實信箱
- 以 `eyJ` 開頭的 JWT 字串（anon key）

若在**已追蹤的檔案**（例如 .md、.js、.jsx）裡找到，請改成佔位或刪除後再 push。

---

## 程式碼中的敏感資料

- **不要**在程式裡寫死 Supabase URL、anon key、或信箱。
- 一律用 `import.meta.env.VITE_xxx` 讀取，實際值只放在本機 `.env` 或部署平台的環境變數。

---

## 本次已幫你做的修正

- **DEPLOY_VERCEL_NETLIFY.md**：文件中的範例 Supabase URL 已改為 `https://xxxx.supabase.co`，不再使用你的專案 ID。
- **.gitignore**：已加入 `.env.development`、`.env.production` 等，避免其他 env 檔被誤傳。
