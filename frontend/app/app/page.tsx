'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { TaskList } from '@/components/TaskList';

interface Group {
  id: string;
  name: string;
  color: string;
  _count: { tasks: number };
}

export default function AppPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/groups');
      const data = res.data.data;
      setGroups(data);
      if (!selectedGroupId && data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    } catch {
      // handled by interceptor
    }
  }, [selectedGroupId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Listen for group selection from sidebar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSelectedGroupId(e.detail.groupId);
    };
    window.addEventListener('select-group' as any, handler);
    return () => window.removeEventListener('select-group' as any, handler);
  }, []);

  // Listen for groups refresh
  useEffect(() => {
    const handler = () => fetchGroups();
    window.addEventListener('refresh-groups', handler);
    return () => window.removeEventListener('refresh-groups', handler);
  }, [fetchGroups]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {selectedGroup ? (
        <>
          <div className="mb-8 animate-fade-in-up">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              {selectedGroup.name}
            </h1>
          </div>
          <TaskList
            groupId={selectedGroup.id}
            onTaskChange={fetchGroups}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center animate-fade-in-up">
            <p className="text-text-secondary text-lg">
              {groups.length === 0
                ? 'Cr\u00e9ez votre premier groupe pour commencer.'
                : 'S\u00e9lectionnez un groupe.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
