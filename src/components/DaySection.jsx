import { useState, memo } from 'react';
import { ChevronDown, Trash2, Plus } from 'lucide-react';
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

const DaySection = memo(({ day, isActive, onClick, index, onUpdateDay, onDeleteDay, id, isEditMode }) => {
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

  const handleUpdateEvent = (eventIndex, updatedEvent) => {
    const newEvents = [...day.events];
    newEvents[eventIndex] = updatedEvent;
    onUpdateDay({ ...day, events: newEvents });
  };

  const handleDeleteEvent = (eventIndex) => {
    if (window.confirm('確定要刪除這個行程嗎？')) {
      const newEvents = day.events.filter((_, i) => i !== eventIndex);
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
      link: ""
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
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 text-white flex justify-between items-center sticky top-0 z-10 relative group/day-header">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 text-center min-w-[3.5rem]">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Day</div>
              <div className="text-xl md:text-2xl font-bold leading-none">{index + 1}</div>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{formatDate(day.date)}</h2>
              <p className="text-blue-100 text-sm opacity-90">{day.events.length} 個行程</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-150 ease-in-out ${
            isActive
              ? 'max-h-[10000px] opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 md:p-6 space-y-4 bg-gray-50/50">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={day.events.map((_, idx) => `event-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                {day.events.map((event, idx) => (
                  <SortableEventCard
                    key={idx}
                    index={idx}
                    event={event}
                    onUpdate={(updatedEvent) => handleUpdateEvent(idx, updatedEvent)}
                    onDelete={() => handleDeleteEvent(idx)}
                    isEditMode={isEditMode}
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
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {isEditMode && (
              <button
                onClick={handleAddEvent}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-center gap-2 font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
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
