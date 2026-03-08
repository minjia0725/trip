import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import EditableEventCard from './EditableEventCard';

const SortableEventCard = ({ event, index, onUpdate, onDelete, isEditMode, searchQuery }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `event-${index}`, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 z-20 touch-none select-none"
          title="拖動重新排序"
        >
          <GripVertical size={20} />
        </div>
      )}
      <EditableEventCard
        event={event}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isEditMode={isEditMode}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default SortableEventCard;
