# 上傳 GitHub 與部署注意事項

專案只給身邊朋友使用時，注意以下設定不要外流。

---

## 不會被上傳的檔案（已在 .gitignore）

這些**不會**被 push 到 GitHub，可以放心：

| 檔案 / 資料夾 | 說明 |
|---------------|------|
| **`.env`** | 你的 Supabase URL、anon key、允許登入的信箱等，**絕對不要上傳** |
| `.env.local` | 同上，本機環境變數 |
| `node_modules/` | 套件，clone 後自己 `npm install` |
| `dist/` | 打包產物，部署時再建即可 |

只要 **不要把 `.env` 從 .gitignore 拿掉**，就不會誤傳。

---

## 可以上傳的

- **`.env.example`**：只有範例與說明，沒有真實金鑰或信箱，**可以**上傳，方便自己或別人 clone 後知道要設哪些變數。
- 其餘程式碼、`supabase-schema.sql`、文件等都可上傳。

---

## 上傳前檢查

1. 確認 **沒有** 把 `.env` 加入 git：
   ```bash
   git status
   ```
   若列表裡出現 `.env`，不要 `git add .env`，也不要 commit 它。

2. 確認 **`.env.example` 裡沒有真實資料**：  
   應為 `your-project-id`、`your-anon-key-here`、`your-email@example.com` 這類佔位，不是你的真實網址、key 或信箱。

---

## 部署（給朋友用）時

1. 在要部署的環境（Vercel、Netlify 等）**不要**上傳 `.env` 檔。
2. 在該平台的 **Environment Variables / 環境變數** 裡，手動新增：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALLOWED_EMAIL`（你的信箱，只有你能登入）
   - `VITE_DISABLE_SIGNUP=true`（若你要關閉註冊）
3. 重新部署後，只有你知道的 Supabase 與登入設定會生效，程式庫裡不會有秘密。

---

## 用什麼「架站」？GitHub 跟 Vercel/Netlify 差在哪？

- **GitHub**：放程式碼用的（repository），不是拿來「架網站」的。你 push 程式碼上去，別人可以 clone，但**不會**自動變成一個可以開的網址。
- **要有一個網址給朋友開**：需要「部署／架站」服務，常見免費選擇是 **Vercel** 或 **Netlify**。他們會從你的 GitHub 拉程式碼、幫你建置、給你一個網址（例如 `https://你的專案.vercel.app`）。

所以流程是：**程式碼放 GitHub → 用 Vercel 或 Netlify 連到 GitHub 專案 → 他們幫你架站 + 設環境變數**。

### 推薦：Vercel 或 Netlify（免費、有環境變數介面）

兩者都有免費方案，不用信用卡也能用，很適合個人小專案。

| 平台 | 免費方案 | 特點 |
|------|----------|------|
| **Vercel** | 有 | 和 React/Vite 很搭，介面簡單 |
| **Netlify** | 有 | 也很常用，一樣可連 GitHub 自動部署 |

選其中一個即可（例如先選 Vercel）。

---

## 一步一步：用 Vercel 架站 + 設環境變數

### 第一步：程式碼先推到 GitHub

1. 在 GitHub 建立一個新 repository（若還沒有）。
2. 在本機專案資料夾執行（若還沒做過）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的帳號/你的專案名.git
   git push -u origin main
   ```
   注意：不要 `git add .env`，`.env` 已在 .gitignore 裡不會被加入。

### 第二步：用 Vercel 連到 GitHub 並部署

1. 打開 [vercel.com](https://vercel.com)，用 **GitHub 帳號**登入。
2. 點 **「Add New…」→「Project」**。
3. 選 **Import Git Repository**，選你剛 push 上去的 **GitHub 專案**，按 Import。
4. **Framework Preset** 選 **Vite**（通常會自動偵測）。
5. **Root Directory** 維持預設（專案根目錄）即可。
6. 先不要填環境變數，直接點 **Deploy**，讓第一次部署跑完（可能會失敗或跑起來但登入不能用，沒關係）。

### 第三步：在 Vercel 後台加環境變數

1. 部署完成後，進入該 **Project** 的頁面。
2. 上方選單點 **「Settings」**。
3. 左側選 **「Environment Variables」**。
4. 在 **Key** 和 **Value** 欄位一筆一筆新增（把你本機 `.env` 的內容照抄過去）：

   | Key（名稱） | Value（值） |
   |-------------|-------------|
   | `VITE_SUPABASE_URL` | 你的 Supabase 專案 URL（例如 `https://xxxx.supabase.co`） |
   | `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key（長長一串） |
   | `VITE_ALLOWED_EMAIL` | 你的信箱（只有這個信箱能登入） |
   | `VITE_DISABLE_SIGNUP` | `true` |

5. 每一筆填完按 **Save**。  
6. 回到 **Deployments**，在最新一次部署右側點 **「⋯」→「Redeploy」**，讓 Vercel 用新的環境變數重新建置一次。

完成後，你的網址（例如 `https://你的專案.vercel.app`）就可以給朋友開，且只有你設定的信箱能登入。

---

## 若改用 Netlify

1. 打開 [netlify.com](https://www.netlify.com)，用 GitHub 登入。
2. **Add new site → Import an existing project**，選 GitHub，選你的專案。
3. **Build command** 填：`npm run build`，**Publish directory** 填：`dist`。
4. 在 **Site settings → Environment variables** 裡，同樣新增 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`VITE_ALLOWED_EMAIL`、`VITE_DISABLE_SIGNUP`。
5. 儲存後觸發 **Trigger deploy** 重新部署。

---

## 關於「直接用 GitHub 免費架站」

- **GitHub Pages**：可以放靜態網站，但 **沒有**像 Vercel/Netlify 那種「在網頁上填環境變數」的介面。要用 GitHub Actions 把秘密寫在 repo 的 Secrets 裡再建置，步驟較多、也比較容易搞混。
- 建議：**程式碼放 GitHub，架站用 Vercel 或 Netlify**，環境變數在他們後台填一次即可，之後每次 push 會自動重新部署。

---

## 總結

- **不要上傳**：`.env`（已由 .gitignore 排除）。
- **可以上傳**：程式碼、`.env.example`（僅範例）。
- **部署時**：在平台後台設環境變數，不要從本機上傳 `.env`。

這樣放到 GitHub 給朋友看或一起用，就不會洩漏你的金鑰或信箱。

---

## 只用免費 Supabase、避免被收費

你只有自己會部署、只有自己（或極少人）登入時，用 **免費方案** 就夠了，只要注意下面幾點就不會有被收費的風險。

### 免費方案大概有什麼

- **資料庫**：約 500 MB
- **登入人數**：每月約 50,000 位「活躍使用者」以內（你+朋友遠低於這個數字）
- **流量**：約 5 GB 流出／月
- **專案數**：免費帳號最多 2 個專案

行程小專案、只有你在用或少量朋友看，很難超過這些額度。

### 怎樣才不會被收費

1. **不要升級方案**  
   在 Supabase 後台不要點「Upgrade」或綁定信用卡，就只會用免費方案。免費方案**不會**因為用量超過就自動扣款，頂多是專案被暫停或限制，不會默默收費。

2. **只有一個專案**  
   這個東京行程專案用一個 Supabase 專案就好，不要開很多個，就不會佔滿 2 個免費專案額度。

3. **注意「不活躍會暫停」**  
   免費專案若**超過一週完全沒人用**，Supabase 可能會自動暫停（pause）。之後有人要開網站時，到 Supabase Dashboard 把專案「Resume」即可，不會因此收費。

4. **用量大致心裡有數即可**  
   只有你在登入、存行程，資料量與流量都很小，一般不會碰到 500 MB 或 5 GB 上限。

### 總結

- 不升級、不綁卡 → 不會被收費。
- 免費額度對「自己 + 身邊朋友」使用非常夠用。
- 若專案被暫停，到後台手動 Resume 即可，仍不收費。
