'use client';

import { useState } from 'react';
import { HistoryList } from '@/components/HistoryList';
import { HistoryCalendar } from '@/components/HistoryCalendar';

export default function HistoryPage() {
  const [tab, setTab] = useState<'list' | 'calendar'>('list');

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-6">
          Historique
        </h1>
        <div className="flex gap-1 bg-bg-surface border border-border rounded-input p-1 w-fit">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-2 text-sm rounded-[6px] transition-colors ${
              tab === 'list'
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setTab('calendar')}
            className={`px-4 py-2 text-sm rounded-[6px] transition-colors ${
              tab === 'calendar'
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Calendrier
          </button>
        </div>
      </div>

      {tab === 'list' ? <HistoryList /> : <HistoryCalendar />}
    </div>
  );
}
