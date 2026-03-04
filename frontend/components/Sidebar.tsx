'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { GroupItem } from '@/components/GroupItem';

interface Group {
  id: string;
  name: string;
  color: string;
  order: number;
  _count: { tasks: number };
}

export function Sidebar() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.data);
    } catch {
      // handled by interceptor
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Auto-select first group
  useEffect(() => {
    if (groups.length > 0 && !selectedId) {
      selectGroup(groups[0].id);
    }
  }, [groups, selectedId]);

  // Listen for refresh events
  useEffect(() => {
    const handler = () => fetchGroups();
    window.addEventListener('refresh-groups', handler);
    return () => window.removeEventListener('refresh-groups', handler);
  }, [fetchGroups]);

  const selectGroup = (id: string) => {
    setSelectedId(id);
    setMobileOpen(false);
    window.dispatchEvent(
      new CustomEvent('select-group', { detail: { groupId: id } }),
    );
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await api.post('/groups', { name: newName.trim() });
      setNewName('');
      setCreating(false);
      await fetchGroups();
      selectGroup(res.data.data.id);
      window.dispatchEvent(new Event('refresh-groups'));
    } catch {
      // Error handled
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/groups/${id}`);
      await fetchGroups();
      if (selectedId === id) {
        setSelectedId(null);
      }
      window.dispatchEvent(new Event('refresh-groups'));
    } catch {
      // Error handled
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h2 className="font-heading text-lg font-bold text-text-primary">
          Mes groupes
        </h2>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {groups.map((group, i) => (
          <GroupItem
            key={group.id}
            group={group}
            selected={selectedId === group.id}
            onSelect={() => selectGroup(group.id)}
            onDelete={() => handleDelete(group.id)}
            className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
          />
        ))}

        {creating ? (
          <div className="px-3 py-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setCreating(false);
                  setNewName('');
                }
              }}
              onBlur={() => {
                if (!newName.trim()) {
                  setCreating(false);
                  setNewName('');
                }
              }}
              placeholder="Nom du groupe..."
              className="w-full bg-bg-surface-alt border border-accent rounded-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 transition-colors"
            />
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-accent transition-colors rounded-input"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau groupe
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={() => { router.push('/app'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-input transition-colors ${
            pathname === '/app'
              ? 'text-accent bg-accent/10'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          T&acirc;ches
        </button>
        <button
          onClick={() => { router.push('/app/history'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-input transition-colors ${
            pathname === '/app/history'
              ? 'text-accent bg-accent/10'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          Historique
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-text-primary truncate">
            {user?.displayName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-input"
            title="Changer de th\u00e8me"
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-text-secondary hover:text-priority-high transition-colors rounded-input"
            title="D\u00e9connexion"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-bg-surface border-r border-border h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile bottom nav toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-72 flex flex-col bg-bg-surface border-r border-border z-50 animate-fade-in-up">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
