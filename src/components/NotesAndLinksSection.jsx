import { useMemo, memo } from 'react';
import { Link as LinkIcon, Plus, Trash2, ExternalLink } from 'lucide-react';
import LinkPreview from './LinkPreview';

const NotesAndLinksSection = memo(({ notes, setNotes, isEditMode }) => {
  // 解析連結項目（使用 useMemo 優化）
  const linkItems = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s\n]+)/g;
    const lines = notes.split('\n');
    const linkItems = [];
    const processedUrls = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const urlMatch = line.match(urlRegex);
      if (urlMatch) {
        urlMatch.forEach(url => {
          if (!processedUrls.has(url)) {
            processedUrls.add(url);
            const urlIndex = line.indexOf(url);
            let textBeforeUrl = line.substring(0, urlIndex).trim();
            let displayText = textBeforeUrl;
            if (!displayText && i > 0) {
              let prevLineIndex = i - 1;
              while (prevLineIndex >= 0) {
                const prevLine = lines[prevLineIndex].trim();
                if (!prevLine || prevLine.match(urlRegex) || prevLine.match(/^\d+\./)) {
                  if (prevLine && !prevLine.match(urlRegex) && !prevLine.match(/^\d+\./)) {
                    displayText = prevLine;
                    break;
                  }
                  break;
                }
                displayText = prevLine;
                break;
              }
            }
            if (!displayText) displayText = url;
            linkItems.push({ url, text: displayText, originalLineIndex: i });
          }
        });
      }
    }
    return linkItems;
  }, [notes]);

  // 獲取非連結的備註文字（使用 useMemo 優化）
  const otherNotes = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s\n]+)/g;
    const lines = notes.split('\n');
    return lines
      .filter((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.match(urlRegex)) return false;
        if (index < lines.length - 1) {
          const nextLine = lines[index + 1].trim();
          if (nextLine && nextLine.match(urlRegex)) {
            return false;
          }
        }
        return true;
      })
      .join('\n');
  }, [notes]);

  // 添加新連結
  const handleAddLink = () => {
    const separator = notes.trim() ? '\n' : '';
    setNotes(notes + separator + '新連結\nhttps://');
  };

  // 更新連結
  const handleUpdateLink = (oldUrl, newText, newUrl) => {
    const lines = notes.split('\n');
    const item = linkItems.find(l => l.url === oldUrl);
    if (item) {
      const lineIndex = item.originalLineIndex;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        if (newUrl.match(/(https?:\/\/[^\s\n]+)/g)) {
          lines[lineIndex] = newUrl;
        } else {
          return;
        }

        if (lineIndex > 0) {
          const prevLine = lines[lineIndex - 1].trim();
          if (!prevLine.match(/(https?:\/\/[^\s\n]+)/g) && !prevLine.match(/^\d+\./)) {
            if (newText && newText !== newUrl) {
              lines[lineIndex - 1] = newText;
            } else {
              lines.splice(lineIndex - 1, 1);
            }
          } else if (newText && newText !== newUrl) {
            lines.splice(lineIndex, 0, newText);
          }
        } else if (newText && newText !== newUrl) {
          lines.splice(lineIndex, 0, newText);
        }
      }
      setNotes(lines.join('\n'));
    }
  };

  // 刪除連結
  const handleDeleteLink = (url) => {
    const lines = notes.split('\n');
    const item = linkItems.find(l => l.url === url);
    if (item) {
      const lineIndex = item.originalLineIndex;
      if (lineIndex >= 0) {
        lines.splice(lineIndex, 1);
        if (lineIndex > 0) {
          const prevLine = lines[lineIndex - 1].trim();
          if (prevLine && !prevLine.match(/^\d+\./) && !prevLine.match(/(https?:\/\/[^\s\n]+)/g)) {
            lines.splice(lineIndex - 1, 1);
          }
        }
      }
      setNotes(lines.join('\n'));
    }
  };

  // 更新其他備註
  const handleUpdateOtherNotes = (newNotes) => {
    const urlRegex = /(https?:\/\/[^\s\n]+)/g;
    const lines = notes.split('\n');
    const linkData = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && line.match(urlRegex)) {
        const urlMatch = line.match(urlRegex);
        urlMatch.forEach(url => {
          let text = '';
          if (i > 0) {
            const prevLine = lines[i - 1].trim();
            if (prevLine && !prevLine.match(urlRegex) && !prevLine.match(/^\d+\./)) {
              text = prevLine;
            }
          }
          linkData.push({ text, url });
        });
      }
    }

    const newLines = newNotes.split('\n').filter(l => l.trim());
    linkData.forEach(item => {
      if (item.text) {
        newLines.push(item.text);
      }
      newLines.push(item.url);
    });

    setNotes(newLines.join('\n'));
  };

  return (
    <div className="mt-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon size={18} className="text-blue-600" />
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">備註與連結</label>
          {isEditMode && (
            <button
              type="button"
              onClick={handleAddLink}
              className="ml-auto flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 active:bg-blue-200 active:scale-95 transition-all duration-100"
            >
              <Plus size={12} /> 新增連結
            </button>
          )}
        </div>

        {linkItems.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 mb-1">連結列表：</div>
            {linkItems.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg border border-gray-100 relative group">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(item.url)}
                      className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-100 hover:scale-110 z-10"
                      title="刪除此連結"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-500 w-12 flex-shrink-0">名稱:</label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleUpdateLink(item.url, e.target.value, item.url)}
                        className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-500 w-12 flex-shrink-0">URL:</label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleUpdateLink(item.url, item.text, e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-sm text-blue-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none truncate"
                      />
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 flex-shrink-0"
                        title="開啟連結"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </>
                ) : (
                  <LinkPreview url={item.url} title={item.text !== item.url ? item.text : null} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs font-semibold text-gray-500 mb-1">其他備註：</div>
        <textarea
          disabled={!isEditMode}
          value={otherNotes}
          onChange={(e) => handleUpdateOtherNotes(e.target.value)}
          placeholder="在此輸入其他備註..."
          rows={4}
          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y leading-relaxed disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        />
      </div>
    </div>
  );
});

NotesAndLinksSection.displayName = 'NotesAndLinksSection';

export default NotesAndLinksSection;
