import json
import re

def format_time(time_str):
    """格式化時間字串為標準格式 HH:MM"""
    if not time_str:
        return ""
    
    time_str = time_str.strip()
    
    def format_single_time(t):
        if not t:
            return ""
        t = t.strip()
        
        # 移除多餘的空格
        t = re.sub(r'\s+', '', t)
        
        # 如果已經是標準格式 (HH:MM)，直接返回並補零
        if ':' in t:
            parts = t.split(':')
            hour = parts[0].zfill(2)
            minute = parts[1].zfill(2) if len(parts) > 1 and parts[1] else '00'
            return f"{hour}:{minute}"
        
        # 處理 "5.30" 或 "12." 格式
        if '.' in t:
            parts = t.split('.')
            hour = parts[0].zfill(2)
            # 處理分鐘部分，可能有多個點或空格
            minute_str = parts[1] if len(parts) > 1 else ''
            # 移除空格和非數字字符
            minute_str = re.sub(r'[^\d]', '', minute_str)
            minute = minute_str.zfill(2) if minute_str else '00'
            return f"{hour}:{minute}"
        
        # 如果只有數字，假設是小時
        if t.isdigit():
            return f"{t.zfill(2)}:00"
        
        return t
    
    # 處理範圍時間 "開始 ~ 結束"
    if '~' in time_str:
        parts = time_str.split('~')
        start = format_single_time(parts[0])
        end = format_single_time(parts[1]) if len(parts) > 1 else ''
        return f"{start} ~ {end}" if end else f"{start} ~"
    
    # 單一時間
    return format_single_time(time_str)

# 讀取 JSON 檔案
with open('src/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 格式化所有時間
for day in data:
    for event in day['events']:
        if event.get('time'):
            old_time = event['time']
            new_time = format_time(old_time)
            if old_time != new_time:
                print(f"更新: '{old_time}' -> '{new_time}'")
            event['time'] = new_time

# 寫回檔案
with open('src/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n所有時間格式已更新完成！")
