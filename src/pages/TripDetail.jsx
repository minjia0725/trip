import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Plus, ChevronUp } from 'lucide-react';
import DaySection from '../components/DaySection';
import NotesAndLinksSection from '../components/NotesAndLinksSection';
import MobileHeader from '../components/MobileHeader';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/dateTime';
import { useAuth } from '../contexts/AuthContext';
import { getTripById, updateTrip } from '../lib/tripsDb';

function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthEnabled } = useAuth();
  const [itinerary, setItinerary] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef(null);
  const hasInitialized = useRef(false);

  const useDb = Boolean(user && isAuthEnabled);

  // Load data on mount：登入用 DB，未登入用 localStorage
  useEffect(() => {
    hasInitialized.current = false;
    const loadData = async () => {
      setIsLoading(true);
      if (useDb) {
        const { data: trip, error } = await getTripById(tripId);
        if (error || !trip) {
          navigate('/');
          return;
        }
        setTripInfo(trip);
        setItinerary(Array.isArray(trip.data) ? trip.data : []);
        setNotes(trip.notes ?? '');
      } else {
        const savedTrips = localStorage.getItem('trip-planner-trips');
        if (!savedTrips) {
          navigate('/');
          return;
        }
        const trips = JSON.parse(savedTrips);
        const trip = trips.find(t => t.id === tripId);
        if (!trip) {
          navigate('/');
          return;
        }
        setTripInfo(trip);
        setItinerary(trip.data && trip.data.length > 0 ? trip.data : []);
        setNotes(trip.notes ?? '');
      }
      setIsLoading(false);
    };
    loadData();
  }, [tripId, navigate, useDb]);

  // 當行程載入後，默認展開第一天
  useEffect(() => {
    if (itinerary.length > 0 && !isLoading && !hasInitialized.current) {
      setActiveDayIndex(new Set([0]));
      hasInitialized.current = true;
    }
  }, [itinerary.length, isLoading]);

  // Save data：登入時寫入 DB（防抖），未登入時寫入 localStorage
  useEffect(() => {
    if (isLoading || !tripId) return;

    const timeoutId = setTimeout(() => {
      let dateStr = tripInfo?.date ?? '未設定';
      if (itinerary.length > 0 && itinerary[0].date) {
        const first = itinerary[0].date.match(/(\d{1,2})月(\d{1,2})日/);
        const last = itinerary[itinerary.length - 1].date.match(/(\d{1,2})月(\d{1,2})日/);
        if (first && last) dateStr = `${first[1]}/${first[2]} - ${last[1]}/${last[2]}`;
      }
      if (useDb) {
        updateTrip(tripId, {
          data: itinerary,
          days: itinerary.length,
          notes,
          date: dateStr
        }).then(({ error }) => {
          if (error) console.error('儲存失敗:', error);
        });
      } else {
        const savedTrips = localStorage.getItem('trip-planner-trips');
        if (savedTrips) {
          const trips = JSON.parse(savedTrips);
          const idx = trips.findIndex(t => t.id === tripId);
          if (idx !== -1) {
            trips[idx].data = itinerary;
            trips[idx].days = itinerary.length;
            trips[idx].notes = notes;
            trips[idx].date = dateStr;
            localStorage.setItem('trip-planner-trips', JSON.stringify(trips));
          }
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [itinerary, notes, isLoading, tripId, useDb, tripInfo?.date]);

  // 滾動監聽器（高效能版本）
  useEffect(() => {
    if (isLoading) return;

    let rafId = null;
    const handleScroll = () => {
      if (rafId) return; // 如果已經有待處理的請求，跳過
      
      rafId = requestAnimationFrame(() => {
        const mainElement = mainRef.current;
        if (mainElement) {
          const scrollTop = mainElement.scrollTop;
          const scrollHeight = mainElement.scrollHeight;
          const clientHeight = mainElement.clientHeight;
          const shouldShow = scrollHeight > clientHeight && scrollTop > 20;
          setShowScrollTop(prev => prev !== shouldShow ? shouldShow : prev);
        }
        rafId = null;
      });
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      // 初始檢查
      handleScroll();
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        mainElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isLoading]);

  const scrollToTop = useCallback(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleUpdateDay = useCallback((dayIndex, updatedDay) => {
    setItinerary(prev => {
      const newItinerary = [...prev];
      newItinerary[dayIndex] = updatedDay;
      return newItinerary;
    });
  }, []);

  const handleDeleteDay = useCallback((dayIndex) => {
    if (window.confirm('確定要刪除這一天嗎？這一天的所有行程都會被刪除。')) {
      setItinerary(prev => prev.filter((_, i) => i !== dayIndex));
    }
  }, []);

  const handleDownload = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(itinerary, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${tripInfo?.name || 'trip'}_plan.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [itinerary, tripInfo?.name]);

  const scrollToDay = useCallback((index) => {
    const element = document.getElementById(`day-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveDayIndex(new Set([index]));
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleAddDay = useCallback(() => {
    setItinerary(prev => [
      ...prev,
      {
        date: `Day ${prev.length + 1}`,
        events: []
      }
    ]);
  }, []);

  const totalJpy = useMemo(() => {
    return itinerary.reduce((acc, day) => {
      return acc + day.events.reduce((sum, event) => {
        const cost = parseFloat(String(event.cost_jpy).replace(/[^0-9.]/g, '')) || 0;
        return sum + cost;
      }, 0);
    }, 0);
  }, [itinerary]);

  const totalTwd = useMemo(() => {
    return itinerary.reduce((acc, day) => {
      return acc + day.events.reduce((sum, event) => {
        const cost = parseFloat(String(event.cost_twd).replace(/[^0-9.]/g, '')) || 0;
        return sum + cost;
      }, 0);
    }, 0);
  }, [itinerary]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!tripInfo) {
    return null;
  }

  // 動態生成 SEO meta tags
  const pageTitle = tripInfo ? `${tripInfo.name} - 行程規劃` : '行程規劃';
  const pageDescription = tripInfo 
    ? `查看 ${tripInfo.name} 的詳細行程規劃，包含日期 ${tripInfo.date}、${tripInfo.days} 天的活動安排和預算追蹤。`
    : '查看旅程的詳細行程規劃，包含活動安排和預算追蹤。';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        {tripInfo && (
          <>
            <meta name="keywords" content={`${tripInfo.name}, 行程規劃, 旅程管理, ${tripInfo.date}`} />
            <meta property="og:site_name" content="行程規劃工具" />
          </>
        )}
      </Helmet>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          backgroundColor: '#f8fafc'
        }}>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50"></div>

      {/* 小畫面固定 Header */}
      <MobileHeader
        tripName={tripInfo.name}
        totalJpy={totalJpy}
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onOpenSidebar={openSidebar}
      />

      {/* 側邊欄 */}
      <Sidebar
        tripInfo={tripInfo}
        itinerary={itinerary}
        activeDayIndex={activeDayIndex}
        totalJpy={totalJpy}
        totalTwd={totalTwd}
        isEditMode={isEditMode}
        isSidebarOpen={isSidebarOpen}
        onToggleEditMode={toggleEditMode}
        onCloseSidebar={closeSidebar}
        onScrollToDay={scrollToDay}
        onAddDay={handleAddDay}
        onDownload={handleDownload}
      />

      {/* 主要內容區域 */}
      <main ref={mainRef} className="flex-1 h-screen overflow-y-auto relative z-10 scroll-smooth pt-16 md:pt-0 pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 md:px-8">
          {itinerary.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/50 max-w-md mx-auto">
                <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">還沒有行程</h2>
                <p className="text-gray-500 mb-6">開始建立你的第一個行程吧！</p>
                {isEditMode && (
                  <button
                    onClick={() => {
                      const newDay = {
                        date: `Day 1`,
                        events: []
                      };
                      setItinerary([newDay]);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all duration-100 font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isEditMode}
                  >
                    <Plus size={20} />
                    新增第一天
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {itinerary.map((day, index) => (
                <DaySection
                  key={index}
                  id={`day-${index}`}
                  index={index}
                  day={day}
                  isActive={activeDayIndex.has(index)}
                  onClick={() => {
                    setActiveDayIndex(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(index)) {
                        newSet.delete(index);
                      } else {
                        newSet.add(index);
                      }
                      return newSet;
                    });
                  }}
                  onUpdateDay={(updatedDay) => handleUpdateDay(index, updatedDay)}
                  onDeleteDay={() => handleDeleteDay(index)}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          )}

          {/* 備註區域 - 移到最底部 */}
          <NotesAndLinksSection
            notes={notes}
            setNotes={setNotes}
            isEditMode={isEditMode}
          />
        </div>
      </main>

      {/* 回到頂部按鈕 - 使用 Portal 渲染到 body，確保不被遮擋 */}
      {showScrollTop && createPortal(
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-4 md:p-3 rounded-full shadow-2xl flex items-center justify-center touch-manipulation"
          title="回到頂部"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            zIndex: 999999,
            position: 'fixed',
            bottom: '5rem',
            right: '1rem',
          }}
          aria-label="回到頂部"
        >
          <ChevronUp size={24} className="md:w-5 md:h-5" />
        </button>,
        document.body
      )}
    </div>
    </>
  );
}

export default TripDetail;
