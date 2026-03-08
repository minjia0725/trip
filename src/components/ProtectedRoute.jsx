import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 未登入時導向 /login，登入後可再導回原本要去的頁面。
 * 若未啟用 Supabase（isAuthEnabled === false），則不強制登入，直接渲染 children。
 */
export function ProtectedRoute({ children }) {
  const { user, loading, isAuthEnabled } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse text-stone-500">載入中...</div>
      </div>
    );
  }

  // 未啟用 Supabase 時不強制登入（例如只用 localStorage 的開發情境）
  if (!isAuthEnabled) {
    return children;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
