import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronRight, Wallet, Plus, Download, X, Lock, Unlock, LogIn, LogOut, Moon, Sun, Bookmark } from 'lucide-react';
import { formatDate } from '../utils/dateTime';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function SidebarAuthBlock() {
  const { user, signOut, isAuthEnabled } = useAuth();
  if (!isAuthEnabled) return null;
  return (
    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
      {user ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email}>{user.email}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut size={14} />
            登出
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <LogIn size={14} />
          登入
        </Link>
      )}
    </div>
  );
}

const Sidebar = memo(({
  tripInfo,
  itinerary,
  activeDayIndex,
  totalJpy,
  totalTwd,
  dailyBudget = [],
  isEditMode,
  isSidebarOpen,
  onToggleEditMode,
  onCloseSidebar,
  onScrollToDay,
  onAddDay,
  onDownload,
  onSaveAsTemplate,
}) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <aside className={`
        no-print fixed inset-y-0 left-0 z-50 w-80 min-w-[280px] max-w-[90vw] md:max-w-none bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-150 ease-in-out md:translate-x-0 md:static md:shadow-none md:border-r md:border-gray-200 dark:md:border-gray-700 md:flex md:flex-col md:h-screen md:sticky md:top-0 md:z-40 md:w-80
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gradient-to-br from-blue-600 to-indigo-700 text-white md:bg-none md:text-gray-900 md:from-transparent md:to-transparent md:dark:bg-gray-800 md:dark:from-gray-800 md:dark:to-gray-800 md:dark:text-gray-100 relative">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-nowrap min-w-0">
              <Link to="/" className="flex items-center gap-1.5 text-white/80 hover:text-white md:text-gray-600 md:hover:text-gray-900 md:dark:text-gray-300 md:dark:hover:text-white shrink-0">
                <ArrowLeft size={16} />
                <span className="text-sm">返回</span>
              </Link>
              <span className="text-gray-300 md:text-gray-400 dark:text-gray-500 shrink-0">/</span>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-1.5 min-w-0 truncate md:dark:text-gray-100">
                <MapPin className="md:text-blue-600 md:dark:text-blue-400 shrink-0" size={18} />
                <span className="truncate">{tripInfo.name}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-nowrap">
              <p className="text-sm opacity-80 md:text-gray-500 md:dark:text-gray-400 whitespace-nowrap">{tripInfo.date} 行程規劃</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditMode();
                }}
                className={`ml-2 p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isEditMode
                    ? 'bg-white/20 md:bg-blue-50 md:dark:bg-gray-700 text-white md:text-blue-600 md:dark:text-blue-300 hover:bg-white/30 md:hover:bg-blue-100 md:dark:hover:bg-gray-600'
                    : 'bg-white/20 md:bg-gray-100 md:dark:bg-gray-700 text-white md:text-gray-600 md:dark:text-gray-300 hover:bg-white/30 md:hover:bg-gray-200 md:dark:hover:bg-gray-600'
                }`}
                title={isEditMode ? '切換到瀏覽模式' : '切換到編輯模式'}
              >
                {isEditMode ? <Unlock size={16} /> : <Lock size={16} />}
              </button>
              <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                isEditMode
                  ? 'bg-white/20 md:bg-blue-50 md:dark:bg-gray-700 text-white md:text-blue-600 md:dark:text-blue-300'
                  : 'bg-white/20 md:bg-gray-100 md:dark:bg-gray-700 text-white md:text-gray-600 md:dark:text-gray-300'
              }`}>
                {isEditMode ? '編輯模式' : '瀏覽模式'}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onCloseSidebar();
            }}
            className="md:hidden text-white/80 hover:text-white active:text-white p-2 -mr-2 -mt-2 flex-shrink-0 relative z-[60] touch-manipulation cursor-pointer"
            type="button"
            aria-label="關閉側邊欄"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2 min-h-0">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">每日行程</div>
          {itinerary.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              還沒有行程，開始新增吧！
            </div>
          ) : (
            itinerary.map((day, index) => (
              <button
                key={index}
                onClick={() => onScrollToDay(index)}
                className={`w-full text-left px-4 py-4 rounded-xl flex items-center gap-3 group ${
                  activeDayIndex.has(index)
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-gray-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0 ${
                  activeDayIndex.has(index) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] truncate">{formatDate(day.date)}</div>
                  <div className="text-sm opacity-60 truncate">{day.events.length} 個行程</div>
                </div>
                <ChevronRight size={16} className={`opacity-0 transition-opacity ${activeDayIndex.has(index) ? 'opacity-100 text-blue-400 dark:text-blue-400' : 'group-hover:opacity-50'}`} />
              </button>
            ))
          )}
        </nav>

        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Wallet size={18} className="text-blue-600 dark:text-blue-400" />
              總花費概覽
            </h3>
            {isEditMode && (
              <button
                onClick={onAddDay}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isEditMode}
              >
                <Plus size={16} />
                新增天
              </button>
            )}
          </div>
          {dailyBudget.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {dailyBudget.map((d, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>第{i + 1}天</span>
                  <span>¥{d.jpy.toLocaleString()} / ${d.twd.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>日幣 (JPY):</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">¥{totalJpy.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>台幣 (TWD):</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">${totalTwd.toLocaleString()}</span>
          </div>
          {onSaveAsTemplate && (
            <button
              type="button"
              onClick={onSaveAsTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Bookmark size={18} />
              存為範本
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleTheme(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={theme === 'dark' ? '切換淺色' : '切換深色'}
            aria-label={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? '淺色模式' : '深色模式'}
          </button>
          {isEditMode && (
            <button
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isEditMode}
            >
              <Download size={18} />
              下載行程 (JSON)
            </button>
          )}
          <SidebarAuthBlock />
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onCloseSidebar}
        ></div>
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
