# Vercel 或 Netlify 部署教學（一步一步）

你的專案已在 GitHub：**https://github.com/minjia0725/trip**

選 **其中一個** 平台做就好（建議先試 Vercel，介面較單純）。

---

# 方案 A：用 Vercel 部署

## 1. 登入 Vercel

1. 打開瀏覽器，到 **https://vercel.com**
2. 點右上角 **「Sign Up」** 或 **「Log In」**
3. 選 **「Continue with GitHub」**，用你的 GitHub 帳號（minjia0725）授權登入

## 2. 從 GitHub 匯入專案

1. 登入後會進到 Vercel 首頁，點 **「Add New…」** → **「Project」**
2. 畫面會列出你的 GitHub 專案，找到 **「trip」**，右側點 **「Import」**
3. 進入設定頁：
   - **Project Name**：可維持 `trip` 或改成你喜歡的名稱（網址會是 `https://trip.vercel.app`）
   - **Framework Preset**：選 **Vite**（若已自動偵測就不用改）
   - **Root Directory**：留空（代表專案根目錄）
   - **Build and Output Settings**：通常不用改，Vercel 會用 `npm run build`、輸出目錄 `dist`

## 3. 先不加環境變數，第一次部署

1. 下方 **「Environment Variables」** 先**不要**填，直接點 **「Deploy」**
2. 等 1～2 分鐘，跑完會給你一個網址（例如 `https://trip-xxx.vercel.app`）
3. 第一次部署後網站可能可以開，但**登入會壞掉**（因為還沒設 Supabase 等變數），沒關係，下一步就來設

## 4. 加上環境變數（重要）

1. 部署完成後，點進該 **Project**（專案名稱）
2. 上方選單點 **「Settings」**
3. 左側選 **「Environment Variables」**
4. 一筆一筆新增（**Key** 和 **Value** 照你本機 `.env` 填）：

   | Key（名稱） | Value（值） |
   |-------------|-------------|
   | `VITE_SUPABASE_URL` | 你的 Supabase 專案 URL（例如 `https://xxxx.supabase.co`） |
   | `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key（整串貼上） |
   | `VITE_ALLOWED_EMAIL` | 你的信箱（只有這個信箱能登入） |
   | `VITE_DISABLE_SIGNUP` | `true` |

5. 每一筆填完按 **「Save」**
6. **Environment** 可以選 **Production**（或全選 Production / Preview / Development）

## 5. 重新部署讓變數生效

1. 上方選單點 **「Deployments」**
2. 找到最新那一次部署，右側點 **「⋯」**（三個點）
3. 選 **「Redeploy」**，再按 **「Redeploy」** 確認
4. 等建置跑完，再開你的網址，登入就應該會正常

完成後你的網站網址就是 **https://你的專案名.vercel.app**，可以分享給朋友（只有你設定的信箱能登入）。

---

# 方案 B：用 Netlify 部署

## 1. 登入 Netlify

1. 打開 **https://www.netlify.com**
2. 點 **「Sign up」** 或 **「Log in」**
3. 選 **「Sign up with GitHub」** 或 **「Log in with GitHub」**，用 GitHub 授權

## 2. 從 GitHub 匯入專案

1. 登入後點 **「Add new site」** → **「Import an existing project」**
2. 選 **「Deploy with GitHub」**，若被要求授權 Netlify 存取 GitHub，按 **「Authorize」**
3. 在列表找到 **「minjia0725/trip」**，點 **「Import」** 或 **「Configure netlify」**
4. 建置設定（通常會自動帶出）：
   - **Branch to deploy**：`main`
   - **Build command**：`npm run build`
   - **Publish directory**：`dist`
5. 下方 **「Environment variables」** 先不填，直接點 **「Deploy site」**

## 3. 第一次部署

等 1～2 分鐘，Netlify 會給你一個網址（例如 `https://隨機名稱.netlify.app`）。此時登入可能還不能用的，正常。

## 4. 加上環境變數

1. 進到該 **Site** 的後台
2. 上方選單 **「Site configuration」** → 左側 **「Environment variables」**（或 **「Build & deploy」→「Environment」**）
3. 點 **「Add a variable」** 或 **「Add environment variables」**，一筆一筆新增：

   | Key | Value |
   |-----|--------|
   | `VITE_SUPABASE_URL` | 你的 Supabase URL |
   | `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key |
   | `VITE_ALLOWED_EMAIL` | 你的信箱 |
   | `VITE_DISABLE_SIGNUP` | `true` |

4. 儲存

## 5. 重新部署

1. 選單 **「Deploy」** 或 **「Deploys」**
2. 點 **「Trigger deploy」** → **「Deploy site」**（或 **Clear cache and deploy**）
3. 等建置完成，再開網址測試登入

完成後網址就是 **https://你的站名.netlify.app**。

---

# 之後每次改程式

- **Vercel**：只要在本機 `git push` 到 GitHub，Vercel 會自動重新部署。
- **Netlify**：一樣，push 到 GitHub 後會自動重新部署。

環境變數不用重設，除非你要改 Supabase 或信箱設定。

---

# 常見問題

**Q：打開網站是 404？**

1. 確認專案裡有 **vercel.json**（已包含 `outputDirectory: "dist"` 和 SPA 的 rewrites），並已 push 到 GitHub，等 Vercel 重新部署完成。
2. 到 Vercel 後台：**Project → Settings → General**，在 **Build & Development Settings** 檢查：
   - **Framework Preset**：Vite  
   - **Build Command**：`npm run build`（或留空用預設）  
   - **Output Directory**：一定要填 **`dist`**（Vite 打包後的資料夾）  
3. 改完儲存後，到 **Deployments** 點 **Redeploy** 再部署一次。

**Q：登入還是壞的？**  
確認 4 個環境變數都有填、沒有多餘空格，且填完後有做 **Redeploy / Trigger deploy**。

**Q：可以改網址嗎？**  
- Vercel：Settings → Domains 可改子網域或綁自己的網域。  
- Netlify：Domain settings 可改子網域或綁自己的網域。

**Q：要付費嗎？**  
兩邊免費方案對個人小站都夠用，不綁信用卡就不會收費。
