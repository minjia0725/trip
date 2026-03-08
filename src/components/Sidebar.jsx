import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronRight, Wallet, Plus, Download, X, Lock, Unlock, LogIn, LogOut } from 'lucide-react';
import { formatDate } from '../utils/dateTime';
import { useAuth } from '../contexts/AuthContext';

function SidebarAuthBlock() {
  const { user, signOut, isAuthEnabled } = useAuth();
  if (!isAuthEnabled) return null;
  return (
    <div className="pt-3 mt-3 border-t border-gray-200">
      {user ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 py-1.5 text-sm text-gray-600 hover:text-red-600"
          >
            <LogOut size={14} />
            登出
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 py-1.5 text-sm text-blue-600 hover:text-blue-700"
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
  isEditMode,
  isSidebarOpen,
  onToggleEditMode,
  onCloseSidebar,
  onScrollToDay,
  onAddDay,
  onDownload,
}) => {
  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-150 ease-in-out md:translate-x-0 md:static md:shadow-none md:border-r md:border-gray-200 md:flex md:flex-col md:h-screen md:sticky md:top-0 md:z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-br from-blue-600 to-indigo-700 text-white md:bg-none md:text-gray-900 md:from-transparent md:to-transparent relative">
          <div className="flex-1 min-w-0 pr-2">
            <Link to="/" className="flex items-center gap-2 mb-2 text-white/80 hover:text-white md:text-gray-600 md:hover:text-gray-900">
              <ArrowLeft size={16} />
              <span className="text-sm">返回</span>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="md:text-blue-600" />
              {tripInfo.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-nowrap">
              <p className="text-sm opacity-80 md:text-gray-500 whitespace-nowrap">{tripInfo.date} 行程規劃</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditMode();
                }}
                className={`ml-2 p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isEditMode
                    ? 'bg-white/20 md:bg-blue-50 text-white md:text-blue-600 hover:bg-white/30 md:hover:bg-blue-100'
                    : 'bg-white/20 md:bg-gray-100 text-white md:text-gray-600 hover:bg-white/30 md:hover:bg-gray-200'
                }`}
                title={isEditMode ? '切換到瀏覽模式' : '切換到編輯模式'}
              >
                {isEditMode ? <Unlock size={16} /> : <Lock size={16} />}
              </button>
              <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                isEditMode
                  ? 'bg-white/20 md:bg-blue-50 text-white md:text-blue-600'
                  : 'bg-white/20 md:bg-gray-100 text-white md:text-gray-600'
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

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">每日行程</div>
          {itinerary.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              還沒有行程，開始新增吧！
            </div>
          ) : (
            itinerary.map((day, index) => (
              <button
                key={index}
                onClick={() => onScrollToDay(index)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 group ${
                  activeDayIndex.has(index)
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  activeDayIndex.has(index) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{formatDate(day.date)}</div>
                  <div className="text-xs opacity-60 truncate">{day.events.length} 個行程</div>
                </div>
                <ChevronRight size={16} className={`opacity-0 transition-opacity ${activeDayIndex.has(index) ? 'opacity-100 text-blue-400' : 'group-hover:opacity-50'}`} />
              </button>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Wallet size={18} className="text-blue-600" />
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
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600">日幣 (JPY):</span>
            <span className="text-blue-600 font-bold">¥{totalJpy.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600">台幣 (TWD):</span>
            <span className="text-blue-600 font-bold">${totalTwd.toLocaleString()}</span>
          </div>
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
