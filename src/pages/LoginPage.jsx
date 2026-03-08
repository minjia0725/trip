import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp, signOut, isAuthEnabled, allowedEmail, isRestrictedToSingleEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const signupDisabled = import.meta.env.VITE_DISABLE_SIGNUP === 'true' || isRestrictedToSingleEmail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    const fn = !signupDisabled && isSignUp ? signUp : signIn;
    const { data, error } = await fn(email, password);

    setSubmitting(false);

    if (error) {
      setMessage({ type: 'error', text: error.message || '發生錯誤' });
      return;
    }

    if (isRestrictedToSingleEmail && data?.user && data.user.email?.trim().toLowerCase() !== allowedEmail) {
      await signOut();
      setMessage({ type: 'error', text: '此應用僅限授權使用者使用，您無法登入。' });
      return;
    }

    if (isSignUp && data?.user && !data?.session) {
      setMessage({
        type: 'success',
        text: '請到信箱點擊確認信完成註冊，再使用此頁登入。',
      });
      return;
    }

    setMessage({ type: 'success', text: isSignUp ? '註冊成功，請登入' : '登入成功' });
    navigate(from, { replace: true });
  };

  if (!isAuthEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-stone-800 mb-2">尚未設定登入</h1>
          <p className="text-stone-600 mb-4">
            請在專案中設定 <code className="bg-stone-200 px-1 rounded">VITE_SUPABASE_URL</code> 與{' '}
            <code className="bg-stone-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>，並在 Supabase 後台啟用 Authentication。
          </p>
          <Link
            to="/"
            className="inline-block text-amber-700 hover:text-amber-800 font-medium"
          >
            ← 返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{signupDisabled ? '登入' : (isSignUp ? '註冊' : '登入')} | 東京行程</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-stone-800">
              {signupDisabled ? '登入' : (isSignUp ? '註冊帳號' : '登入')}
            </h1>
            <p className="text-stone-500 mt-1 text-sm">
              {signupDisabled
                ? (isRestrictedToSingleEmail ? '僅限授權使用者登入，不開放註冊' : '僅開放登入，不開放註冊')
                : isSignUp
                  ? '建立帳號以同步你的行程'
                  : '使用信箱與密碼登入'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                信箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                密碼
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                placeholder="至少 6 碼"
              />
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {submitting ? (
                '處理中...'
              ) : !signupDisabled && isSignUp ? (
                <>
                  <UserPlus size={18} />
                  註冊
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  登入
                </>
              )}
            </button>
          </form>

          {!signupDisabled && (
            <p className="mt-5 text-center text-sm text-stone-500">
              {isSignUp ? '已有帳號？' : '還沒有帳號？'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage({ type: '', text: '' });
                }}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                {isSignUp ? '登入' : '註冊'}
              </button>
            </p>
          )}

          <p className="mt-4 text-center">
            <Link to="/" className="text-stone-500 hover:text-stone-700 text-sm">
              ← 返回首頁
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
