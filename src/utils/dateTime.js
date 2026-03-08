// 日期格式化函數
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  
  // 處理 "Day 1 3/26 (四)" 格式
  const dayMatch = dateStr.match(/Day\s+\d+\s+(\d{1,2})\/(\d{1,2})\s*\(([一二三四五六日])\)/);
  if (dayMatch) {
    const month = parseInt(dayMatch[1]);
    const day = parseInt(dayMatch[2]);
    const weekday = dayMatch[3];
    
    const weekdayMap = {
      '一': '週一', '二': '週二', '三': '週三', '四': '週四',
      '五': '週五', '六': '週六', '日': '週日'
    };
    
    return `${month}月${day}日 (${weekdayMap[weekday] || weekday})`;
  }
  
  // 處理 "3/26 (四)" 格式
  const simpleMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\s*\(([一二三四五六日])\)/);
  if (simpleMatch) {
    const month = parseInt(simpleMatch[1]);
    const day = parseInt(simpleMatch[2]);
    const weekday = simpleMatch[3];
    
    const weekdayMap = {
      '一': '週一', '二': '週二', '三': '週三', '四': '週四',
      '五': '週五', '六': '週六', '日': '週日'
    };
    
    return `${month}月${day}日 (${weekdayMap[weekday] || weekday})`;
  }
  
  // 如果已經是格式化過的，直接返回
  if (dateStr.includes('月') && dateStr.includes('日')) {
    return dateStr;
  }
  
  // 其他格式，嘗試清理
  return dateStr.replace(/^Day\s+\d+\s+/, '').trim();
};

// 時間格式化函數
export const formatTime = (timeStr) => {
  if (!timeStr) return "";
  
  const formatSingleTime = (t) => {
    if (!t) return "";
    t = t.trim().toUpperCase();
    
    let isPM = false;
    if (t.includes('PM') || t.includes('P.M.')) {
      isPM = true;
      t = t.replace(/PM|P\.M\./gi, '').trim();
    } else if (t.includes('AM') || t.includes('A.M.')) {
      t = t.replace(/AM|A\.M\./gi, '').trim();
    }
    
    if (/^\d{1,2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(':');
      let hour = parseInt(h);
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
      return `${hour.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
    }
    
    if (t.includes('.')) {
      const parts = t.split('.');
      let hour = parseInt(parts[0]);
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
      const minute = parts[1] ? parts[1].padStart(2, '0') : '00';
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }
    
    if (/^\d+$/.test(t)) {
      let hour = parseInt(t);
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    
    return t;
  };
  
  if (timeStr.includes('~')) {
    const parts = timeStr.split('~');
    const start = formatSingleTime(parts[0].trim());
    const end = parts[1] ? formatSingleTime(parts[1].trim()) : '';
    return end ? `${start} ~ ${end}` : `${start} ~`;
  }
  
  return formatSingleTime(timeStr);
};
