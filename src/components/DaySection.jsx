import { useState, memo } from 'react';
import { ChevronDown, Trash2, Plus, Copy } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { formatDate } from '../utils/dateTime';
import SortableEventCard from './SortableEventCard';
import EditableEventCard from './EditableEventCard';

const DaySection = memo(({ day, isActive, onClick, index, onUpdateDay, onDeleteDay, onCopyDay, id, isEditMode, searchQuery, visibleIndices: visibleIndicesProp }) => {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalEvents = day.events.length;
  const visibleIndices = visibleIndicesProp ?? (totalEvents > 0 ? day.events.map((_, i) => i) : []);
  const isFiltered = visibleIndices.length < totalEvents && totalEvents > 0;

  const handleUpdateEvent = (realIndex, updatedEvent) => {
    const newEvents = [...day.events];
    newEvents[realIndex] = updatedEvent;
    onUpdateDay({ ...day, events: newEvents });
  };

  const handleDeleteEvent = (realIndex) => {
    if (window.confirm('確定要刪除這個行程嗎？')) {
      const newEvents = day.events.filter((_, i) => i !== realIndex);
      onUpdateDay({ ...day, events: newEvents });
    }
  };

  const handleAddEvent = () => {
    const newEvent = {
      time: "",
      activities: [""],
      activity: "",
      cost_twd: "",
      cost_jpy: "",
      link: "",
      tag: "",
      location: ""
    };
    onUpdateDay({ ...day, events: [...day.events, newEvent] });
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('event-', ''));
      const newIndex = parseInt(over.id.toString().replace('event-', ''));

      const newEvents = arrayMove(day.events, oldIndex, newIndex);
      onUpdateDay({ ...day, events: newEvents });
    }
  };

  return (
    <div id={id} className="mb-8 scroll-mt-24 md:scroll-mt-8">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 text-white flex justify-between items-center sticky top-0 z-10 relative group/day-header">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 text-center min-w-[3.5rem]">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Day</div>
              <div className="text-xl md:text-2xl font-bold leading-none">{index + 1}</div>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{formatDate(day.date)}</h2>
              <p className="text-blue-100 text-sm opacity-90">
                {visibleIndices.length} 個行程{isFiltered ? ' (已篩選)' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCopyDay && isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyDay(index);
                }}
                className="p-2 hover:bg-white/20 rounded-full opacity-80 hover:opacity-100 text-white/90 hover:text-white touch-manipulation"
                title="複製此日"
                type="button"
                aria-label="複製此日"
              >
                <Copy size={20} />
              </button>
            )}
            {onDeleteDay && isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDay(index);
                }}
                className="p-2 hover:bg-red-500/20 rounded-full opacity-80 hover:opacity-100 text-white/90 hover:text-white touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                title="刪除此天"
                type="button"
                aria-label="刪除此天"
                disabled={!isEditMode}
              >
                <Trash2 size={20} />
              </button>
            )}
            {isEditMode && (
              <button
                onClick={onClick}
                className="p-2 hover:bg-white/20 rounded-full opacity-80 hover:opacity-100 text-white/90 hover:text-white touch-manipulation cursor-pointer"
                type="button"
                aria-label={isActive ? "收起" : "展開"}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ChevronDown
                  size={24}
                  className={`transition-transform duration-150 ease-in-out transform ${isActive ? 'rotate-0' : '-rotate-90'}`}
                  style={{ transformOrigin: 'center' }}
                />
              </button>
            )}
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-150 ease-in-out ${
            !isEditMode ? 'max-h-[10000px] opacity-100' : isActive ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`p-4 md:p-6 bg-gray-50/50 dark:bg-gray-800/50 ${isEditMode ? 'space-y-4' : 'space-y-2'}`}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleIndices.map((i) => `event-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {visibleIndices.map((realIndex) => (
                  <SortableEventCard
                    key={realIndex}
                    index={realIndex}
                    event={day.events[realIndex]}
                    onUpdate={(updatedEvent) => handleUpdateEvent(realIndex, updatedEvent)}
                    onDelete={() => handleDeleteEvent(realIndex)}
                    isEditMode={isEditMode}
                    searchQuery={searchQuery}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="opacity-50">
                    <EditableEventCard
                      event={day.events[parseInt(activeId.toString().replace('event-', ''))]}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                      isEditMode={isEditMode}
                      searchQuery={searchQuery}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {isEditMode && !isFiltered && (
              <button
                onClick={handleAddEvent}
                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 flex items-center justify-center gap-2 font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isEditMode}
              >
                <div className="bg-gray-200 group-hover:bg-blue-100 p-1 rounded-full transition-colors">
                  <Plus size={18} />
                </div>
                新增行程
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DaySection.displayName = 'DaySection';

export default DaySection;
