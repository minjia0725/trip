import { useState, useEffect, memo } from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

// 預覽緩存（避免重複請求）
const previewCache = new Map();

const LinkPreview = memo(({ url, title, size = 'default' }) => {
  const isCompact = size === 'compact';
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    // 檢查緩存
    if (previewCache.has(url)) {
      setPreview(previewCache.get(url));
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      setLoading(true);
      setError(false);

      try {
        // 方法1: 嘗試使用 oEmbed（僅適用於支援 CORS 的服務）
        // 注意：Instagram oembed 不支援 CORS，所以跳過
        const oEmbedProviders = {
          'youtube.com': `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
          'youtu.be': `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
          // Instagram 和 Twitter 的 oembed 不支援 CORS，跳過
          // 'instagram.com': `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`,
          // 'twitter.com': `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
          // 'x.com': `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
        };

        const domain = new URL(url).hostname.replace('www.', '');
        let oEmbedUrl = null;

        for (const [key, apiUrl] of Object.entries(oEmbedProviders)) {
          if (domain.includes(key)) {
            oEmbedUrl = apiUrl;
            break;
          }
        }

        if (oEmbedUrl) {
          try {
            const response = await fetch(oEmbedUrl);
            if (response.ok) {
              const data = await response.json();
              const previewData = {
                title: data.title || title || url,
                description: data.author_name || data.provider_name || '',
                image: data.thumbnail_url || null,
                html: data.html || null,
                type: 'oembed',
              };
              previewCache.set(url, previewData);
              setPreview(previewData);
              setLoading(false);
              return;
            }
          } catch (e) {
            // oEmbed 失敗，繼續嘗試其他方法
          }
        }

        // 方法2: 使用 Microlink API（免費，無需 API key）
        // 注意：Microlink 有速率限制，如果遇到 429 錯誤，直接使用基本預覽
        try {
          const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
          const response = await fetch(microlinkUrl);

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              const previewData = {
                title: data.data.title || title || url,
                description: data.data.description || '',
                image: data.data.image?.url || null,
                type: 'microlink',
              };
              previewCache.set(url, previewData);
              setPreview(previewData);
              setLoading(false);
              return;
            }
          } else if (response.status === 429) {
            // 遇到速率限制，直接使用基本預覽，不要繼續嘗試
            throw new Error('Rate limited');
          }
        } catch (e) {
          // Microlink API 失敗（包括 429），直接使用基本預覽
          // 不繼續嘗試其他方法
        }

        // 方法3: 基本預覽（使用 favicon 和域名）
        const urlObj = new URL(url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
        
        const previewData = {
          title: title || urlObj.hostname,
          description: urlObj.pathname,
          image: faviconUrl,
          type: 'basic',
        };
        previewCache.set(url, previewData);
        setPreview(previewData);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url, title]);

  if (loading) {
    return (
      <div className={`border border-gray-200 rounded-lg bg-gray-50 animate-pulse ${isCompact ? 'p-2' : 'p-3'}`}>
        <div className={`bg-gray-200 rounded ${isCompact ? 'h-3 w-2/3 mb-1.5' : 'h-4 w-3/4 mb-2'}`}></div>
        <div className={`bg-gray-200 rounded ${isCompact ? 'h-2.5 w-1/2' : 'h-3 w-1/2'}`}></div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors ${isCompact ? 'p-1.5' : 'p-2'}`}
      >
        <ExternalLink size={isCompact ? 12 : 14} className="text-gray-400 flex-shrink-0" />
        <span className={`text-blue-600 hover:text-blue-800 flex-1 hover:underline truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {title || url}
        </span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-100 group"
    >
      {preview.html ? (
        // oEmbed HTML（如 YouTube 影片）
        <div 
          className="w-full"
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      ) : (
        <div className={`flex overflow-hidden ${isCompact ? 'gap-2 p-2' : 'gap-3 p-3'}`}>
          {preview.image && (
            <div className={`flex-shrink-0 bg-gray-100 rounded overflow-hidden ${isCompact ? 'w-14 h-14' : 'w-24 h-24'}`}>
              <img
                src={preview.image}
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className={`flex items-start gap-1.5 ${isCompact ? 'mb-0.5' : 'mb-1'}`}>
              {preview.type === 'basic' && preview.image && (
                <img
                  src={preview.image}
                  alt=""
                  className={`flex-shrink-0 mt-0.5 ${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <h4 className={`font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {preview.title}
              </h4>
            </div>
            {preview.description && (
              <p className={`text-gray-500 line-clamp-2 ${isCompact ? 'text-[10px] mt-0.5' : 'text-xs mt-1'}`}>
                {preview.description}
              </p>
            )}
            <div className={`flex items-center gap-1 ${isCompact ? 'mt-1' : 'mt-2'}`}>
              <ExternalLink size={isCompact ? 10 : 12} className="text-gray-400" />
              <span className={`text-gray-400 truncate ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                {new URL(url).hostname.replace('www.', '')}
              </span>
            </div>
          </div>
        </div>
      )}
    </a>
  );
});

LinkPreview.displayName = 'LinkPreview';

export default LinkPreview;
