# 登入功能實作指南

專案已使用 **Supabase**，建議直接用 **Supabase Auth** 做登入，不用自己管密碼雜湊、session、JWT。

---

## 方案比較

| 方案 | 優點 | 適合情境 |
|------|------|----------|
| **Supabase Auth**（推薦） | 已整合、支援信箱/密碼、Magic Link、OAuth（Google/GitHub）、免費額度夠用 | 本專案已有 Supabase，最省事 |
| NextAuth.js / Auth.js | 彈性高、多種 provider | 若未來遷到 Next.js 可考慮 |
| 自建後端 + JWT | 完全掌控 | 需要自架 API、資料庫時 |

---

## 使用 Supabase Auth 的步驟

### 1. 在 Supabase 後台開啟 Auth

1. 到 [Supabase Dashboard](https://supabase.com/dashboard) → 你的專案
2. 左側 **Authentication** → **Providers**
3. 啟用 **Email**（信箱/密碼或 Magic Link）
4. 若要 Google/GitHub 登入：在 **Providers** 裡啟用並填寫 OAuth 設定

### 2. 專案內已幫你準備的結構

- `src/contexts/AuthContext.jsx`：全域登入狀態、登入/登出/註冊
- `src/pages/LoginPage.jsx`：登入/註冊表單頁
- `src/components/ProtectedRoute.jsx`：未登入時導向登入頁
- 在 `App.jsx` 裡用 `AuthProvider` 包住，並加上 `/login` 路由與保護邏輯

### 3. 環境變數

確保 `.env` 或 `.env.local` 有：

```env
VITE_SUPABASE_URL=你的專案 URL
VITE_SUPABASE_ANON_KEY=你的 anon key
```

在 Supabase 專案 → **Settings** → **API** 可找到。

### 4. 保護需要登入的頁面

在 `App.jsx` 裡對要保護的路由用 `ProtectedRoute` 包起來，例如：

```jsx
<Route path="/trip/:tripId" element={
  <ProtectedRoute>
    <TripDetail />
  </ProtectedRoute>
} />
```

未登入時會自動導向 `/login`。

### 5. 在元件裡取得使用者

```jsx
import { useAuth } from '../contexts/AuthContext'

function SomeComponent() {
  const { user, signOut } = useAuth()

  return (
    <div>
      {user ? (
        <>
          <span>哈囉，{user.email}</span>
          <button onClick={signOut}>登出</button>
        </>
      ) : (
        <Link to="/login">登入</Link>
      )}
    </div>
  )
}
```

---

## 進階：用 RLS 保護資料

若行程資料存在 Supabase（Postgres），可開 **Row Level Security (RLS)**，讓每筆資料只給「該行程擁有者」讀寫，這樣即使有人拿到 API 網址也無法看到別人的行程。  
這部分可在資料表與 Supabase 後台設定完成後再補上。

---

## 總結

- **推薦做法**：用現有的 Supabase + Supabase Auth，在專案裡加上 AuthContext、Login 頁、ProtectedRoute，並在需要的地方用 `useAuth()`。
- 若你之後想改成「只有部分功能要登入」（例如儲存行程才要登入），可以只保護特定路由或按鈕，其餘保持公開。
