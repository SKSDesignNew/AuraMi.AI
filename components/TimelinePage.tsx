'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

interface TimelineEvent {
  household_id: string;
  sort_date: string | null;
  event_year: number | null;
  title: string;
  event_type: string | null;
  location: string | null;
  description: string | null;
  people_involved: string[] | null;
}

interface TimelinePageProps {
  householdId: string;
}

const typeColors: Record<string, string> = {
  birth: 'bg-[rgba(0,245,255,0.1)] text-[#00F5FF]',
  death: 'bg-[rgba(139,126,132,0.15)] text-text-500',
  marriage: 'bg-[rgba(240,147,251,0.1)] text-pink',
  migration: 'bg-[rgba(123,97,255,0.1)] text-purple',
  achievement: 'bg-[rgba(191,255,0,0.1)] text-[#BFFF00]',
  custom: 'bg-[rgba(96,165,250,0.1)] text-blue',
};

export default function TimelinePage({ householdId }: TimelinePageProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  useEffect(() => {
    loadTimeline();
  }, [householdId]);

  async function loadTimeline() {
    setLoading(true);
    const { data } = await supabase
      .from('family_timeline')
      .select('*')
      .eq('household_id', householdId)
      .order('sort_date', { ascending: true });

    setEvents(data || []);
    setLoading(false);
  }

  const filtered = events.filter((e) => {
    if (yearFrom && e.event_year && e.event_year < parseInt(yearFrom)) return false;
    if (yearTo && e.event_year && e.event_year > parseInt(yearTo)) return false;
    return true;
  });

  // Group by decade
  const decades = new Map<string, TimelineEvent[]>();
  filtered.forEach((e) => {
    const decade = e.event_year ? `${Math.floor(e.event_year / 10) * 10}s` : 'Unknown';
    if (!decades.has(decade)) decades.set(decade, []);
    decades.get(decade)!.push(e);
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-400 font-body">Loading timeline...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{'\uD83D\uDCC5'}</div>
          <h2 className="font-display text-2xl font-bold text-text-800 mb-2">No Events Yet</h2>
          <p className="text-text-500 font-body">
            Record family events through the chat. Try: &quot;Add a wedding event for Ramesh and Savitri in 1958.&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-text-900 mb-1">Family Timeline</h2>
          <p className="font-body text-text-500 text-sm">{events.length} events across your family history</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <input
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder="From year"
            className="w-32 px-3 py-2 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm"
          />
          <input
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder="To year"
            className="w-32 px-3 py-2 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm"
          />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[rgba(0,245,255,0.1)]" />

          {Array.from(decades.entries()).map(([decade, decadeEvents]) => (
            <div key={decade} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink to-coral flex items-center justify-center text-white text-xs font-bold relative z-10">
                  {decade.slice(0, 2)}
                </div>
                <h3 className="font-display text-lg font-bold text-text-800">{decade}</h3>
              </div>

              <div className="ml-[38px] space-y-3">
                {decadeEvents.map((event, i) => (
                  <div
                    key={`${event.title}-${i}`}
                    className="p-4 rounded-card bg-card border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.2)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="font-body font-semibold text-text-800">{event.title}</h4>
                      {event.event_type && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-body font-semibold whitespace-nowrap ${
                            typeColors[event.event_type] || typeColors.custom
                          }`}
                        >
                          {event.event_type}
                        </span>
                      )}
                    </div>
                    {event.event_year && (
                      <p className="text-xs font-body text-text-400 mb-1">
                        {event.sort_date || event.event_year}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs font-body text-text-500 mb-1">{event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm font-body text-text-600 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    {event.people_involved && event.people_involved.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {event.people_involved.map((name) => (
                          <span
                            key={name}
                            className="px-2 py-0.5 rounded-full bg-bg-alt text-text-500 text-[10px] font-body"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
