'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

interface Story {
  id: string;
  title: string;
  content: string;
  era: string | null;
  location: string | null;
  tags: string[] | null;
  created_at: string;
  narrator?: { first_name: string; last_name: string } | null;
}

interface StoriesPageProps {
  householdId: string;
}

export default function StoriesPage({ householdId }: StoriesPageProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    loadStories();
  }, [householdId]);

  async function loadStories() {
    setLoading(true);
    const { data } = await supabase
      .from('stories')
      .select('id, title, content, era, location, tags, created_at, narrator:persons!stories_narrator_id_fkey(first_name, last_name)')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    setStories((data as unknown as Story[]) || []);
    setLoading(false);
  }

  const filtered = stories.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      (s.era && s.era.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-400 font-body">Loading stories...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{'\uD83D\uDCD6'}</div>
          <h2 className="font-display text-2xl font-bold text-text-800 mb-2">No Stories Yet</h2>
          <p className="text-text-500 font-body">
            Share family stories through the chat. Try: &quot;My grandmother used to tell us about the time grandpa walked 10 miles to school during monsoon season.&quot;
          </p>
        </div>
      </div>
    );
  }

  // Reading view
  if (selectedStory) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedStory(null)}
            className="text-sm font-body text-text-500 hover:text-pink transition-colors mb-6"
          >
            &larr; Back to Stories
          </button>

          <h2 className="font-display text-3xl font-bold text-text-900 mb-3">
            {selectedStory.title}
          </h2>

          <div className="flex flex-wrap gap-3 mb-6 text-xs font-body text-text-400">
            {selectedStory.narrator && (
              <span>
                Narrated by {selectedStory.narrator.first_name} {selectedStory.narrator.last_name}
              </span>
            )}
            {selectedStory.era && <span>{selectedStory.era}</span>}
            {selectedStory.location && <span>{selectedStory.location}</span>}
          </div>

          {selectedStory.tags && selectedStory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {selectedStory.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-[rgba(0,245,255,0.08)] text-text-500 text-xs font-body"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <p className="font-body text-text-700 leading-relaxed whitespace-pre-wrap">
              {selectedStory.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-text-900 mb-1">Family Stories</h2>
          <p className="font-body text-text-500 text-sm">{stories.length} stories preserved</p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stories..."
          className="w-full px-4 py-2 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm mb-6"
        />

        <div className="space-y-4">
          {filtered.map((story) => (
            <div
              key={story.id}
              className="p-5 rounded-card bg-card border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.2)] transition-colors cursor-pointer"
              onClick={() => setSelectedStory(story)}
            >
              <h3 className="font-display text-lg font-bold text-text-800 mb-1">
                {story.title}
              </h3>
              <div className="flex flex-wrap gap-3 text-xs font-body text-text-400 mb-2">
                {story.narrator && (
                  <span>
                    By {story.narrator.first_name} {story.narrator.last_name}
                  </span>
                )}
                {story.era && <span>{story.era}</span>}
                {story.location && <span>{story.location}</span>}
              </div>
              <p className="text-sm font-body text-text-600 line-clamp-3 leading-relaxed">
                {story.content}
              </p>
              {story.tags && story.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-bg-alt text-text-400 text-[10px] font-body"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-text-400 font-body">No stories match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
