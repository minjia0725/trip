import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, MapPin, Calendar, Trash2, Edit2, ArrowRight, LogIn, LogOut, CloudUpload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTrips, createTrip, deleteTrip } from '../lib/tripsDb';
import initialItineraryData from '../data.json';

function HomePage() {
  const navigate = useNavigate();
  const { user, signOut, isAuthEnabled } = useAuth();
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [localTripsForImport, setLocalTripsForImport] = useState([]);
  const [importing, setImporting] = useState(false);

  // 載入旅程列表：登入用 DB，未登入用 localStorage
  useEffect(() => {
    if (user && isAuthEnabled) {
      getTrips().then(({ data, error }) => {
        setTrips(data ?? []);
        if (error) console.error('載入行程失敗:', error);
        setTripsLoading(false);
        if ((data ?? []).length === 0) {
          try {
            const saved = localStorage.getItem('trip-planner-trips');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) setLocalTripsForImport(parsed);
            }
          } catch {
            setLocalTripsForImport([]);
          }
        } else {
          setLocalTripsForImport([]);
        }
      });
    } else {
      const loadFromStorage = async () => {
        let defaultNotes = '';
        try {
          const notesModule = await import('../default_notes.json');
          defaultNotes = notesModule.default?.notes || notesModule.notes || '';
        } catch {
          try {
            const res = await fetch(new URL('../default_notes.json', import.meta.url).href);
            if (res.ok) {
              const json = await res.json();
              defaultNotes = json.notes || '';
            }
          } catch {
            defaultNotes = '';
          }
        }
        const saved = localStorage.getItem('trip-planner-trips');
        if (saved) {
          const parsed = JSON.parse(saved);
          const idx = parsed.findIndex(t => t.id === 'tokyo-trip');
          if (idx !== -1 && defaultNotes && !(parsed[idx].notes || '').trim()) {
            parsed[idx].notes = defaultNotes;
            localStorage.setItem('trip-planner-trips', JSON.stringify(parsed));
          }
          setTrips(parsed);
        } else {
          const defaultTrip = {
            id: 'tokyo-trip',
            name: '東京之旅',
            date: '3/26 - 3/31',
            days: initialItineraryData.length,
            createdAt: new Date().toISOString(),
            data: initialItineraryData,
            notes: defaultNotes || ''
          };
          setTrips([defaultTrip]);
          localStorage.setItem('trip-planner-trips', JSON.stringify([defaultTrip]));
        }
        setTripsLoading(false);
      };
      loadFromStorage();
    }
  }, [user, isAuthEnabled]);

  const handleDeleteTrip = async (tripId, e) => {
    e.stopPropagation();
    if (!window.confirm('確定要刪除此旅程嗎？所有資料將會遺失。')) return;
    if (user && isAuthEnabled) {
      const { error } = await deleteTrip(tripId);
      if (error) {
        console.error('刪除失敗:', error);
        return;
      }
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } else {
      const newTrips = trips.filter(t => t.id !== tripId);
      setTrips(newTrips);
      localStorage.setItem('trip-planner-trips', JSON.stringify(newTrips));
    }
  };

  const canCreateTrip = !isAuthEnabled || !!user;

  const handleCreateTrip = async () => {
    if (!canCreateTrip) {
      navigate('/login');
      return;
    }
    const tripName = window.prompt('請輸入旅程名稱：');
    if (!tripName?.trim()) return;
    const name = tripName.trim();
    if (user && isAuthEnabled) {
      const { data: newTrip, error } = await createTrip(user.id, {
        name,
        date: '未設定',
        days: 0,
        data: [],
        notes: ''
      });
      if (error) {
        console.error('新增失敗:', error);
        return;
      }
      setTrips(prev => [newTrip, ...prev]);
      navigate(`/trip/${newTrip.id}`);
    } else {
      const newTrip = {
        id: `trip-${Date.now()}`,
        name,
        date: '未設定',
        days: 0,
        createdAt: new Date().toISOString(),
        data: [],
        notes: ''
      };
      const newTrips = [...trips, newTrip];
      setTrips(newTrips);
      localStorage.setItem('trip-planner-trips', JSON.stringify(newTrips));
      navigate(`/trip/${newTrip.id}`);
    }
  };

  const handleImportFromLocal = async () => {
    if (!user || !isAuthEnabled || localTripsForImport.length === 0) return;
    setImporting(true);
    const created = [];
    for (const t of localTripsForImport) {
      const { data: newTrip, error } = await createTrip(user.id, {
        name: t.name ?? '未命名旅程',
        date: t.date ?? '未設定',
        days: t.days ?? (Array.isArray(t.data) ? t.data.length : 0),
        data: Array.isArray(t.data) ? t.data : [],
        notes: t.notes ?? ''
      });
      if (error) console.error('匯入失敗:', t.name, error);
      else created.push(newTrip);
    }
    setTrips(prev => [...created, ...prev]);
    setLocalTripsForImport([]);
    setImporting(false);
  };

  return (
    <>
      <Helmet>
        <title>行程規劃工具 - 管理您的旅程</title>
        <meta name="description" content="專業的行程規劃工具，幫助您輕鬆管理多個旅程、預算追蹤和活動安排。支援即時編輯、拖曳排序等功能。" />
        <meta property="og:title" content="行程規劃工具 - 管理您的旅程" />
        <meta property="og:description" content="專業的行程規劃工具，幫助您輕鬆管理多個旅程、預算追蹤和活動安排。" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
      {/* Header：小螢幕可換行、縮小間距與字體 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 shrink-0">
              <MapPin className="text-blue-600 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
              <span className="whitespace-nowrap">旅程規劃器</span>
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end min-w-0">
              {isAuthEnabled && (
                user ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[90px] sm:max-w-[140px]" title={user.email}>{user.email}</span>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-gray-600 hover:text-red-600 text-xs sm:text-sm font-medium shrink-0"
                    >
                      <LogOut className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">登出</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-blue-600 hover:text-blue-700 font-medium text-sm shrink-0"
                  >
                    <LogIn className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    登入
                  </Link>
                )
              )}
              {canCreateTrip && (
                <button
                  onClick={handleCreateTrip}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 text-sm sm:text-base font-medium shrink-0"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">新增旅程</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 py-5 sm:px-4 sm:py-8">
        {tripsLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入行程中...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/50 max-w-md mx-auto">
              {localTripsForImport.length > 0 ? (
                <>
                  <CloudUpload size={64} className="mx-auto text-blue-400 mb-4" />
                  <h2 className="text-xl font-bold text-gray-700 mb-2">匯入本機行程到雲端</h2>
                  <p className="text-gray-500 mb-6">
                    偵測到本機有 <strong>{localTripsForImport.length}</strong> 個行程，是否匯入到目前帳號？
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleImportFromLocal}
                      disabled={importing}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {importing ? '匯入中...' : (
                        <>
                          <CloudUpload size={20} />
                          匯入
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setLocalTripsForImport([])}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      不用
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-bold text-gray-700 mb-2">還沒有任何旅程</h2>
                  <p className="text-gray-500 mb-6">
                    {canCreateTrip ? '開始建立你的第一個旅程吧！' : '請先登入以新增旅程。'}
                  </p>
                  {canCreateTrip ? (
                    <button
                      onClick={handleCreateTrip}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                    >
                      <Plus size={20} />
                      建立旅程
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                    >
                      <LogIn size={20} />
                      登入
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className="group bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 overflow-hidden hover:-translate-y-1 min-w-0"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span className="truncate">{trip.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="刪除旅程"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-2">
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">{trip.days}</span> 天行程
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 font-medium text-xs sm:text-sm group-hover:gap-3 transition-all shrink-0">
                      查看詳情
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* 新增旅程卡片：有啟用登入時僅登入後顯示 */}
            {canCreateTrip && (
              <button
                onClick={handleCreateTrip}
                className="group bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] text-gray-500 hover:text-blue-600"
              >
                <div className="bg-gray-100 group-hover:bg-blue-100 p-3 sm:p-4 rounded-full mb-2 sm:mb-3 transition-colors">
                  <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="font-medium text-base sm:text-lg">新增旅程</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
    </>
  );
}

export default HomePage;
