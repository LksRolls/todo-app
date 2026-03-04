'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import api from '@/lib/api';
import { TaskItem, Task } from '@/components/TaskItem';

interface TaskListProps {
  groupId: string;
  onTaskChange: () => void;
}

export function TaskList({ groupId, onTaskChange }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks', { params: { groupId } });
      setTasks(res.data.data);
    } catch {
      // handled
    }
  }, [groupId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const activeTasks = tasks.filter((t) => t.status === 'ACTIVE');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/tasks', { groupId, title: newTitle.trim() });
      setNewTitle('');
      await fetchTasks();
      onTaskChange();
    } catch {
      // handled
    }
  };

  const handleUpdate = async (id: string, data: Partial<Task>) => {
    try {
      await api.patch(`/tasks/${id}`, data);
      await fetchTasks();
      onTaskChange();
    } catch {
      // handled
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks();
      onTaskChange();
    } catch {
      // handled
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
    const newIndex = activeTasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(activeTasks, oldIndex, newIndex);

    // Optimistic update
    setTasks([...reordered, ...completedTasks]);

    // Persist new order
    try {
      await Promise.all(
        reordered.map((task, i) =>
          api.patch(`/tasks/${task.id}`, { order: i }),
        ),
      );
    } catch {
      await fetchTasks();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add task input */}
      <div className="animate-fade-in-up">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') setNewTitle('');
          }}
          placeholder="Ajouter une tâche..."
          className="w-full bg-bg-surface border border-border rounded-card px-5 py-4 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-accent"
        />
      </div>

      {/* Active tasks */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {activeTasks.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={(data) => handleUpdate(task.id, data)}
                onDelete={() => handleDelete(task.id)}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {activeTasks.length === 0 && (
        <div className="text-center py-12 animate-fade-in-up">
          <p className="text-text-secondary">
            Aucune t&acirc;che active. Ajoutez-en une ci-dessus.
          </p>
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
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
              className={`transition-transform ${showCompleted ? 'rotate-90' : ''}`}
            >
              <polyline points="9,18 15,12 9,6" />
            </svg>
            Termin&eacute;es ({completedTasks.length})
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={(data) => handleUpdate(task.id, data)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
