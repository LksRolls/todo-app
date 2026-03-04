'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface HistoryEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  groupName: string;
  action: 'COMPLETED' | 'REACTIVATED';
  timestamp: string;
}

const COLORS = ['#141414', '#1b4332', '#2d6a4f', '#40916c', '#74c69d'];

function getColor(count: number): string {
  if (count === 0) return COLORS[0];
  if (count <= 1) return COLORS[1];
  if (count <= 3) return COLORS[2];
  if (count <= 5) return COLORS[3];
  return COLORS[4];
}

function getDaysInRange(): { date: string; dayOfWeek: number }[] {
  const days: { date: string; dayOfWeek: number }[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayOfWeek: d.getDay(),
    });
  }
  return days;
}

export function HistoryCalendar() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popoverTasks, setPopoverTasks] = useState<HistoryEntry[]>([]);

  const fetchHistory = useCallback(async () => {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    try {
      const res = await api.get('/history', {
        params: {
          from: yearAgo.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
          limit: 5000,
        },
      });
      setEntries(res.data.data.data);
    } catch {
      // handled
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Group completed entries by date
  const completedByDate: Record<string, HistoryEntry[]> = {};
  entries
    .filter((e) => e.action === 'COMPLETED')
    .forEach((entry) => {
      const date = entry.timestamp.split('T')[0];
      if (!completedByDate[date]) completedByDate[date] = [];
      completedByDate[date].push(entry);
    });

  const days = getDaysInRange();

  // Build weeks grid (7 rows x ~52 cols)
  const weeks: { date: string; dayOfWeek: number }[][] = [];
  let currentWeek: { date: string; dayOfWeek: number }[] = [];

  // Pad first week
  if (days[0]) {
    for (let i = 0; i < days[0].dayOfWeek; i++) {
      currentWeek.push({ date: '', dayOfWeek: i });
    }
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const handleCellClick = (date: string) => {
    if (!date) return;
    setSelectedDate(date === selectedDate ? null : date);
    setPopoverTasks(completedByDate[date] || []);
  };

  const reactivate = async (taskId: string) => {
    try {
      await api.post(`/history/${taskId}/reactivate`);
      await fetchHistory();
      window.dispatchEvent(new Event('refresh-groups'));
    } catch {
      // handled
    }
  };

  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="animate-fade-in-up">
      <div className="bg-bg-surface border border-border rounded-card p-6 overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 pt-0">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-[14px] text-[10px] text-text-secondary flex items-center"
              >
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <button
                  key={`${wi}-${di}`}
                  onClick={() => handleCellClick(day.date)}
                  disabled={!day.date}
                  className="w-[14px] h-[14px] rounded-[3px] transition-colors"
                  style={{
                    backgroundColor: day.date
                      ? getColor((completedByDate[day.date] || []).length)
                      : 'transparent',
                    border:
                      selectedDate === day.date
                        ? '1px solid var(--accent-hover)'
                        : '1px solid transparent',
                  }}
                  title={
                    day.date
                      ? `${day.date}: ${(completedByDate[day.date] || []).length} t\u00e2che(s)`
                      : ''
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-text-secondary">
          <span>Moins</span>
          {COLORS.map((color, i) => (
            <div
              key={i}
              className="w-[14px] h-[14px] rounded-[3px]"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>Plus</span>
        </div>
      </div>

      {/* Popover */}
      {selectedDate && (
        <div className="mt-4 bg-bg-surface border border-border rounded-card p-4 animate-fade-in-up">
          <h3 className="font-heading text-sm font-semibold text-text-primary mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {popoverTasks.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Aucune tâche terminée ce jour.
            </p>
          ) : (
            <div className="space-y-2">
              {popoverTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <span className="flex-1 text-text-primary">
                    {task.taskTitle}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {task.groupName}
                  </span>
                  <button
                    onClick={() => reactivate(task.taskId)}
                    className="text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    Réactiver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
