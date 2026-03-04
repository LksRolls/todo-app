'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Task {
  id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
  groupId: string;
}

interface TaskItemProps {
  task: Task;
  onUpdate: (data: Partial<Task>) => void;
  onDelete: () => void;
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
  className = '',
}: TaskItemProps) {
  const [hovering, setHovering] = useState(false);
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
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
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

      {/* Title */}
      <span
        className={`flex-1 text-sm transition-colors ${
          isCompleted
            ? 'text-text-completed line-through decoration-accent/40'
            : 'text-text-primary'
        }`}
      >
        {task.title}
      </span>

      {/* Delete button */}
      {hovering && (
        <button
          onClick={onDelete}
          className="text-text-secondary hover:text-priority-high transition-colors"
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
      )}
    </div>
  );
}
