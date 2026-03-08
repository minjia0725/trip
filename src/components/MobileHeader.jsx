import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Menu, Lock, Unlock } from 'lucide-react';

const MobileHeader = memo(({ tripName, totalJpy, isEditMode, onToggleEditMode, onOpenSidebar }) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Link to="/" className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <button onClick={onOpenSidebar} className="p-2 text-gray-600">
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-900">{tripName}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleEditMode}
          className={`p-1.5 rounded-lg ${
            isEditMode
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isEditMode ? '切換到瀏覽模式' : '切換到編輯模式'}
        >
          {isEditMode ? <Unlock size={18} /> : <Lock size={18} />}
        </button>
        <div className="text-xs font-medium text-right">
          <div className="text-gray-500">預算</div>
          <div className="font-bold text-blue-600">¥{totalJpy.toLocaleString()}</div>
        </div>
      </div>
    </header>
  );
});

MobileHeader.displayName = 'MobileHeader';

export default MobileHeader;
