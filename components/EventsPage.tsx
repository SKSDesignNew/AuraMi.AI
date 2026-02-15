'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

interface Event {
  id: string;
  title: string;
  event_type: string | null;
  event_date: string | null;
  event_year: number | null;
  location: string | null;
  description: string | null;
  created_at: string;
}

interface EventsPageProps {
  householdId: string;
}

const eventTypes = ['all', 'birth', 'death', 'marriage', 'migration', 'achievement', 'custom'];

export default function EventsPage({ householdId }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEvents();
  }, [householdId]);

  async function loadEvents() {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('id, title, event_type, event_date, event_year, location, description, created_at')
      .eq('household_id', householdId)
      .order('event_year', { ascending: false, nullsFirst: true });

    setEvents(data || []);
    setLoading(false);
  }

  const filtered = events.filter((e) => {
    if (filter !== 'all' && e.event_type !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-400 font-body">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{'\uD83C\uDF89'}</div>
          <h2 className="font-display text-2xl font-bold text-text-800 mb-2">No Events Yet</h2>
          <p className="text-text-500 font-body">
            Add family events through the chat. Try: &quot;Record my parents&apos; wedding on June 12, 1985 in Delhi.&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-text-900 mb-1">Family Events</h2>
          <p className="font-body text-text-500 text-sm">{events.length} events recorded</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-colors ${
                filter === type
                  ? 'bg-gradient-to-r from-pink to-coral text-white'
                  : 'bg-bg-alt text-text-500 hover:text-text-700'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full px-4 py-2 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm mb-6"
        />

        {/* Event list */}
        <div className="space-y-3">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-card bg-card border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.2)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-body font-semibold text-text-800">{event.title}</h3>
                {event.event_type && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[rgba(0,245,255,0.08)] text-text-500 text-[10px] font-body font-semibold whitespace-nowrap">
                    {event.event_type}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-xs font-body text-text-400 mb-2">
                {(event.event_date || event.event_year) && (
                  <span>{event.event_date || event.event_year}</span>
                )}
                {event.location && <span>{event.location}</span>}
              </div>
              {event.description && (
                <p className="text-sm font-body text-text-600 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-text-400 font-body">
              No events match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
