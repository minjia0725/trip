import { useState, useEffect, memo } from 'react';
import { Clock, ExternalLink, Trash2, Plus, Link as LinkIcon, MapPin } from 'lucide-react';

const TAG_OPTIONS = [
  { value: '', label: '無' },
  { value: 'optional', label: '選做' },
  { value: 'confirmed', label: '已預訂' },
  { value: 'tbc', label: '待確認' },
];
import { formatTime } from '../utils/dateTime';
import LinkPreview from './LinkPreview';

function highlightText(text, query) {
  if (!text || !query || !query.trim()) return text;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const EditableEventCard = memo(({ event, onUpdate, onDelete, isEditMode = true, searchQuery }) => {
  const [timeMode, setTimeMode] = useState('picker');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [manualTime, setManualTime] = useState(event.time || '');
  
  // 將 activity 轉換為 activities 陣列（向後兼容）
  const getActivities = () => {
    if (event.activities && Array.isArray(event.activities)) {
      return event.activities.length > 0 ? event.activities : [''];
    }
    if (event.activity) {
      const splitActivities = event.activity.split('\n').filter(a => a.trim() !== '');
      return splitActivities.length > 0 ? splitActivities : [''];
    }
    return [''];
  };
  
  const [activities, setActivities] = useState(getActivities());
  
  // 當 event 改變時更新 activities
  useEffect(() => {
    const newActivities = getActivities();
    setActivities(newActivities);
  }, [event.activity, event.activities]);
  
  useEffect(() => {
    const timeStr = event.time || '';
    if (timeStr.includes('~')) {
      const parts = timeStr.split('~');
      const start = parts[0].trim();
      const end = parts[1] ? parts[1].trim() : '';
      
      const toTimeInput = (t) => {
        if (!t) return '';
        if (t.includes(':')) {
          return t.substring(0, 5);
        }
        if (t.includes('.')) {
          const [h, m] = t.split('.');
          return `${h.padStart(2, '0')}:${m ? m.padStart(2, '0') : '00'}`;
        }
        return '';
      };
      
      setStartTime(toTimeInput(start));
      setEndTime(toTimeInput(end));
      setManualTime(timeStr);
    } else if (timeStr) {
      const toTimeInput = (t) => {
        if (!t) return '';
        if (t.includes(':')) return t.substring(0, 5);
        if (t.includes('.')) {
          const [h, m] = t.split('.');
          return `${h.padStart(2, '0')}:${m ? m.padStart(2, '0') : '00'}`;
        }
        return '';
      };
      setStartTime(toTimeInput(timeStr));
      setEndTime('');
      setManualTime(timeStr);
    } else {
      setStartTime('');
      setEndTime('');
      setManualTime('');
    }
  }, [event.time]);
  
  const handleChange = (field, value) => {
    if (field !== 'time') {
      onUpdate({ ...event, [field]: value });
    }
  };
  
  const handleActivityChange = (index, value) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
    const updatedEvent = { ...event, activities: newActivities };
    updatedEvent.activity = newActivities.filter(a => a.trim() !== '').join('\n');
    onUpdate(updatedEvent);
  };
  
  const handleAddActivity = () => {
    const newActivities = [...activities, ''];
    setActivities(newActivities);
    const activityStr = newActivities.filter(a => a.trim() !== '').join('\n');
    onUpdate({ ...event, activities: newActivities, activity: activityStr });
  };
  
  const handleDeleteActivity = (index) => {
    if (activities.length === 1) {
      handleActivityChange(0, '');
      return;
    }
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
    const activityStr = newActivities.filter(a => a.trim() !== '').join('\n');
    onUpdate({ ...event, activities: newActivities, activity: activityStr });
  };
  
  const handleStartTimeChange = (value) => {
    setStartTime(value);
    const timeStr = value ? (endTime ? `${value} ~ ${endTime}` : `${value} ~`) : '';
    onUpdate({ ...event, time: timeStr });
  };
  
  const handleEndTimeChange = (value) => {
    setEndTime(value);
    const timeStr = startTime ? (value ? `${startTime} ~ ${value}` : `${startTime} ~`) : '';
    onUpdate({ ...event, time: timeStr });
  };
  
  const handleManualTimeChange = (value) => {
    setManualTime(value);
    onUpdate({ ...event, time: value });
  };
  
  const handleManualTimeBlur = () => {
    const formatted = formatTime(manualTime);
    if (formatted !== manualTime) {
      setManualTime(formatted);
      onUpdate({ ...event, time: formatted });
    }
  };

  // 瀏覽模式：精簡一覽，標註在右上角、有標註時牌卡底色變化
  if (!isEditMode) {
    const rawActivity = event.activity || (event.activities && event.activities.filter(Boolean).join('\n')) || '—';
    const activityText = searchQuery?.trim() ? highlightText(rawActivity, searchQuery) : rawActivity;
    const hasCost = (event.cost_jpy && String(event.cost_jpy).trim()) || (event.cost_twd && String(event.cost_twd).trim());
    const location = (event.location || '').trim();
    const mapsUrl = location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : null;
    const tagValue = event.tag || '';
    const tagLabel = TAG_OPTIONS.find(o => o.value === tagValue)?.label || '';
    const tagBadgeClass = {
      optional: 'bg-gray-500 text-white',
      confirmed: 'bg-emerald-600 text-white',
      tbc: 'bg-amber-500 text-white',
    }[tagValue] || '';
    const cardBgClass = {
      optional: 'bg-gray-50/90 dark:bg-gray-700/90 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
      confirmed: 'bg-emerald-50/90 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700',
      tbc: 'bg-amber-50/90 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700',
    }[tagValue] || 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-gray-600';
    return (
      <div className={`group relative rounded-xl border shadow-sm py-2.5 px-3 sm:py-3 sm:px-4 hover:shadow transition-colors ${cardBgClass}`}>
        {tagValue && (
          <span className={`absolute top-2 right-2 sm:top-2.5 sm:right-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold shadow-sm ${tagBadgeClass}`}>
            {tagLabel}
          </span>
        )}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4 sm:items-baseline pr-16 sm:pr-20">
          <div className="flex-shrink-0 min-w-[4.5rem] sm:min-w-[7rem] text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums whitespace-nowrap">
            {event.time || '—'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 dark:text-gray-100 font-medium whitespace-pre-line leading-snug text-sm sm:text-base">{activityText}</div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <MapPin size={12} />
                開 Google 地圖
              </a>
            )}
            {hasCost && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                {event.cost_jpy && String(event.cost_jpy).trim() && (
                  <span>¥{String(event.cost_jpy).trim()}</span>
                )}
                {event.cost_twd && String(event.cost_twd).trim() && (
                  <span>${String(event.cost_twd).trim()}</span>
                )}
              </div>
            )}
            {event.link && (
              <div className="mt-1.5 sm:mt-2">
                <LinkPreview url={event.link} size="compact" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 dark:border-gray-700 p-4 relative ${isEditMode ? 'pl-10' : 'pl-4'}`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3 items-start">
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">時間</label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  type="button"
                  disabled={!isEditMode}
                  onClick={() => {
                    setTimeMode('picker');
                    if (manualTime && manualTime.includes('~')) {
                      const parts = manualTime.split('~');
                      const start = parts[0].trim();
                      const end = parts[1] ? parts[1].trim() : '';
                      const toTimeInput = (t) => {
                        if (!t) return '';
                        if (t.includes(':')) return t.substring(0, 5);
                        if (t.includes('.')) {
                          const [h, m] = t.split('.');
                          return `${h.padStart(2, '0')}:${m ? m.padStart(2, '0') : '00'}`;
                        }
                        return '';
                      };
                      setStartTime(toTimeInput(start));
                      setEndTime(toTimeInput(end));
                    }
                  }}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                    timeMode === 'picker'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  選擇
                </button>
                <button
                  type="button"
                  disabled={!isEditMode}
                  onClick={() => {
                    setTimeMode('manual');
                    if (startTime) {
                      const timeStr = endTime ? `${startTime} ~ ${endTime}` : `${startTime} ~`;
                      setManualTime(timeStr);
                      onUpdate({ ...event, time: timeStr });
                    }
                  }}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                    timeMode === 'manual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  手動
                </button>
              </div>
              
              {timeMode === 'picker' ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center">
                  <div className="relative w-full sm:flex-1 flex gap-0.5 sm:gap-1 min-w-0">
                    <Clock size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10 hidden sm:block" />
                    <select
                      disabled={!isEditMode}
                      value={startTime ? startTime.split(':')[0] || '00' : '00'}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = startTime ? startTime.split(':')[1] || '00' : '00';
                        handleStartTimeChange(`${hour}:${minute}`);
                      }}
                      className="flex-1 min-w-0 pl-2 sm:pl-8 pr-1 sm:pr-1.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="self-center text-gray-400 font-bold px-0.5 text-xs sm:text-base">:</span>
                    <select
                      disabled={!isEditMode}
                      value={startTime ? startTime.split(':')[1] || '00' : '00'}
                      onChange={(e) => {
                        const minute = e.target.value;
                        const hour = startTime ? startTime.split(':')[0] || '00' : '00';
                        handleStartTimeChange(`${hour}:${minute}`);
                      }}
                      className="flex-1 min-w-0 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-gray-400 font-medium self-center hidden sm:inline text-sm">~</span>
                  <div className="relative w-full sm:flex-1 flex gap-0.5 sm:gap-1 min-w-0 pt-5 sm:pt-0">
                    <span className="text-gray-400 font-medium absolute top-0 left-0 text-xs sm:hidden">結束時間</span>
                    <select
                      disabled={!isEditMode}
                      value={endTime ? endTime.split(':')[0] || '00' : '00'}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = endTime ? endTime.split(':')[1] || '00' : '00';
                        handleEndTimeChange(`${hour}:${minute}`);
                      }}
                      className="flex-1 min-w-0 pl-1.5 sm:pl-2 pr-1 sm:pr-1.5 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="self-center text-gray-400 font-bold px-0.5 text-xs sm:text-base">:</span>
                    <select
                      disabled={!isEditMode}
                      value={endTime ? endTime.split(':')[1] || '00' : '00'}
                      onChange={(e) => {
                        const minute = e.target.value;
                        const hour = endTime ? endTime.split(':')[0] || '00' : '00';
                        handleEndTimeChange(`${hour}:${minute}`);
                      }}
                      className="flex-1 min-w-0 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={manualTime}
                    onChange={(e) => handleManualTimeChange(e.target.value)}
                    onBlur={handleManualTimeBlur}
                    placeholder="例如: 14:00 ~ 16:00 或 09:00 ~ (24小時制)"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-grow w-full min-w-0">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex gap-3 w-full lg:w-auto flex-shrink-0">
                <div className="flex-1 lg:w-24 xl:w-28 min-w-0">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">日幣 (JPY)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">¥</span>
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={event.cost_jpy || ''}
                      onChange={(e) => handleChange('cost_jpy', e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 bg-white/50 border border-gray-200 rounded text-sm focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex-1 lg:w-24 xl:w-28 min-w-0">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">台幣 (TWD)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={event.cost_twd || ''}
                      onChange={(e) => handleChange('cost_twd', e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 bg-white/50 border border-gray-200 rounded text-sm focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-grow w-full min-w-0">
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">相關連結</label>
                {isEditMode ? (
                  <div className="relative group/link-input">
                    <LinkIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within/link-input:text-blue-500" />
                    <input
                      type="text"
                      value={event.link || ''}
                      onChange={(e) => handleChange('link', e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-8 pr-8 py-1.5 bg-white/50 border border-gray-200 rounded text-sm text-blue-600 focus:border-blue-500 outline-none truncate"
                    />
                    {event.link && (
                      <a 
                        href={event.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        title="開啟連結"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ) : (
                  event.link ? (
                    <div className="mt-1">
                      <LinkPreview url={event.link} />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic py-1.5">無連結</div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 mt-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">地點（開地圖用）</label>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              value={event.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="地址或地名，例如：東京鐵塔"
              className="flex-1 min-w-[140px] px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {(event.location || '').trim() && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location || '').trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                <MapPin size={14} />
                開地圖
              </a>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 mt-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">標註</label>
          <select
            value={event.tag || ''}
            onChange={(e) => handleChange('tag', e.target.value)}
            className="w-full max-w-[140px] px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
          >
            {TAG_OPTIONS.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="pt-2 border-t border-gray-100 mt-1">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">活動內容</label>
            {isEditMode && (
              <button
                type="button"
                onClick={handleAddActivity}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium"
              >
                <Plus size={14} />
                新增活動
              </button>
            )}
          </div>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={activity}
                  onChange={(e) => handleActivityChange(index, e.target.value)}
                  placeholder={`活動 ${index + 1}...`}
                  className="flex-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-base font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
                {isEditMode && activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(index)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded flex-shrink-0"
                    title="刪除此活動"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditMode && (
        <button
          onClick={onDelete}
          className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 z-10"
          title="刪除此行程"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
});

EditableEventCard.displayName = 'EditableEventCard';

export default EditableEventCard;
