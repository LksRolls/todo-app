'use client';

import { useState, useEffect, useRef } from 'react';
import { Task } from '@/components/TaskItem';

interface TaskDetailModalProps {
  task: Task;
  onSave: (data: Partial<Task>) => Promise<void>;
  onClose: () => void;
}

const priorities: { value: Task['priority']; label: string; color: string }[] =
  [
    { value: 'LOW', label: 'Basse', color: 'var(--priority-low)' },
    { value: 'MEDIUM', label: 'Moyenne', color: 'var(--priority-medium)' },
    { value: 'HIGH', label: 'Haute', color: 'var(--priority-high)' },
  ];

export function TaskDetailModal({
  task,
  onSave,
  onClose,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [saving, setSaving] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [notes]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const hasChanges =
    title !== task.title ||
    notes !== (task.notes || '') ||
    priority !== task.priority;

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const updates: Partial<Task> = {};
      if (title !== task.title) updates.title = title.trim();
      if (notes !== (task.notes || ''))
        updates.notes = notes.trim() || undefined;
      if (priority !== task.priority) updates.priority = priority;
      if (Object.keys(updates).length > 0) {
        await onSave(updates);
      }
      onClose();
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up"
      style={{ animationDuration: '150ms' }}
    >
      <div className="w-full max-w-lg mx-4 bg-bg-surface border border-border rounded-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h3 className="text-sm font-medium text-text-secondary">
            Détail de la tâche
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Title input */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-medium text-text-primary border-b border-border pb-2 focus:border-accent transition-colors outline-none"
            placeholder="Titre de la tâche"
          />

          {/* Priority selector */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              Priorité
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    priority === p.value
                      ? 'ring-2 ring-offset-2 ring-offset-bg-surface'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: p.color + '20',
                    color: p.color,
                    ...(priority === p.value ? { ringColor: p.color } : {}),
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              Notes
            </label>
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter une note..."
              rows={3}
              className="w-full bg-bg-surface-alt border border-border rounded-input px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-accent outline-none resize-none"
              style={{ minHeight: '80px', maxHeight: '300px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-input text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || !title.trim() || saving}
              className="px-5 py-2 rounded-input text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
