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

interface Group {
  id: string;
  name: string;
}

export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterGroup, setFilterGroup] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterGroup) params.groupId = filterGroup;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await api.get('/history', { params });
      setEntries(res.data.data.data);
    } catch {
      // handled
    }
  }, [filterGroup, dateFrom, dateTo]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.data);
    } catch {
      // handled
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const reactivate = async (taskId: string) => {
    try {
      await api.post(`/history/${taskId}/reactivate`);
      await fetchHistory();
      window.dispatchEvent(new Event('refresh-groups'));
    } catch {
      // handled
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="bg-bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary"
        >
          <option value="">Tous les groupes</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary"
          placeholder="Du"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary"
          placeholder="Au"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-text-secondary text-center py-12">
            Aucun historique pour le moment.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 bg-bg-surface border border-border rounded-card px-4 py-3"
            >
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  entry.action === 'COMPLETED'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-priority-medium/10 text-priority-medium'
                }`}
              >
                {entry.action === 'COMPLETED' ? 'Termin\u00e9e' : 'R\u00e9activ\u00e9e'}
              </span>
              <span className="flex-1 text-sm text-text-primary">
                {entry.taskTitle}
              </span>
              <span className="text-xs text-text-secondary">
                {entry.groupName}
              </span>
              <span className="text-xs text-text-secondary">
                {new Date(entry.timestamp).toLocaleDateString('fr-FR')}
              </span>
              {entry.action === 'COMPLETED' && (
                <button
                  onClick={() => reactivate(entry.taskId)}
                  className="text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  R\u00e9activer
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
