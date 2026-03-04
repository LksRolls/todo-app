'use client';

import { useState } from 'react';

interface GroupItemProps {
  group: {
    id: string;
    name: string;
    color: string;
    _count: { tasks: number };
  };
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  className?: string;
}

export function GroupItem({
  group,
  selected,
  onSelect,
  onDelete,
  className = '',
}: GroupItemProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-input transition-colors group ${
        selected
          ? 'bg-accent/10 text-accent'
          : 'text-text-primary hover:bg-bg-surface-alt'
      } ${className}`}
    >
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: group.color }}
      />
      <span className="flex-1 text-sm text-left truncate">{group.name}</span>
      {group._count.tasks > 0 && (
        <span className="text-xs text-text-secondary bg-bg-surface-alt px-1.5 py-0.5 rounded-full">
          {group._count.tasks}
        </span>
      )}
      {hovering && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
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
    </button>
  );
}
