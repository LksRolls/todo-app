'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
  groupId: string;
}

interface TaskItemProps {
  task: Task;
  onUpdate: (data: Partial<Task>) => void;
  onDelete: () => void;
  onOpenDetail?: () => void;
  className?: string;
}

const priorityColors: Record<string, string> = {
  LOW: 'var(--priority-low)',
  MEDIUM: 'var(--priority-medium)',
  HIGH: 'var(--priority-high)',
};

export function TaskItem({
  task,
  onUpdate,
  onDelete,
  onOpenDetail,
  className = '',
}: TaskItemProps) {
  const isCompleted = task.status === 'COMPLETED';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isCompleted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleStatus = () => {
    onUpdate({
      status: isCompleted ? 'ACTIVE' : 'COMPLETED',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group flex items-center gap-3 bg-bg-surface border border-border rounded-card px-4 py-3.5 transition-colors hover:border-accent/20 ${className}`}
    >
      {/* Drag handle */}
      {!isCompleted && (
        <button
          {...listeners}
          className="cursor-grab text-text-secondary/30 hover:text-text-secondary transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
      )}

      {/* Priority dot */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: priorityColors[task.priority] }}
      />

      {/* Checkbox */}
      <button
        onClick={toggleStatus}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isCompleted
            ? 'bg-accent border-accent'
            : 'border-border hover:border-accent'
        }`}
      >
        {isCompleted && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </button>

      {/* Title — click to open detail */}
      <button
        onClick={onOpenDetail}
        className={`flex-1 text-left text-sm transition-colors ${
          isCompleted
            ? 'text-text-completed line-through decoration-accent/40'
            : 'text-text-primary hover:text-accent'
        }`}
      >
        <span>{task.title}</span>
      </button>

      {/* Notes indicator */}
      {task.notes && (
        <span className="text-text-secondary/50" title="Cette tâche a des notes">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </span>
      )}

      {/* Delete button — always visible (subtle), brighter on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100 text-text-secondary hover:text-priority-high transition-all shrink-0"
      >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
    </div>
  );
}
