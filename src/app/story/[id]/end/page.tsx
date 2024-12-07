"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Trophy, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import type { Story } from '@/types/story';
import { digitalWhispersScenes } from '@/data/stories/digital-whispers';
import { crownOfDestinyScenes } from '@/data/stories/crown-of-destiny';

// Reuse the getStory function from the story page
const getStory = (id: string): Story | null => {
  const stories: Record<string, Story> = {
    'digital-whispers': {
      id: 'digital-whispers',
      title: 'Digital Whispers',
      author: 'Alex Rivers',
      description: 'A cyberpunk mystery where your choices echo through the digital realm. Uncover the truth behind mysterious messages appearing on your screen.',
      coverImage: '/stories/digital-whispers.jpg',
      category: 'Cyberpunk',
      tags: ['Mystery', 'Technology'],
      stats: {
        rating: 4.8,
        plays: 1243,
        completions: 856,
        averagePlayTime: 45,
      },
      config: {
        startScene: 'start',
        defaultVariables: {
          trust: { value: 0, displayName: 'Trust', hidden: false },
          knowledge: { value: 0, displayName: 'Knowledge', hidden: false },
        },
      },
      scenes: digitalWhispersScenes,
      metadata: {
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        version: '1.0.0',
        estimatedReadTime: 45,
        difficulty: 'Medium',
        genre: ['Cyberpunk', 'Mystery'],
        isPublished: true,
      }
    },
    'crown-of-destiny': {
      id: 'crown-of-destiny',
      title: 'Crown of Destiny',
      author: 'Eleanor Knight',
      description: 'Embark on an epic medieval adventure where your choices shape the fate of a kingdom. Navigate court intrigue and ancient prophecies.',
      coverImage: '/stories/crown-of-destiny.jpg',
      category: 'Medieval',
      tags: ['Fantasy', 'Adventure'],
      stats: {
        rating: 4.6,
        plays: 892,
        completions: 654,
        averagePlayTime: 50,
      },
      config: {
        startScene: 'start',
        defaultVariables: {
          honor: { value: 0, displayName: 'Honor', hidden: false },
          influence: { value: 0, displayName: 'Influence', hidden: false },
        },
      },
      scenes: crownOfDestinyScenes,
      metadata: {
        createdAt: '2024-01-18',
        updatedAt: '2024-01-22',
        version: '1.0.0',
        estimatedReadTime: 50,
        difficulty: 'Medium',
        genre: ['Medieval', 'Fantasy'],
        isPublished: true,
      }
    }
  };

  return stories[id] || null;
};

export default function StoryEndPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [story, setStory] = useState<Story | null>(null);
  const error = searchParams.get('error');

  useEffect(() => {
    const storyId = params.id as string;
    const loadedStory = getStory(storyId);
    setStory(loadedStory);
  }, [params.id]);

  if (!story) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-white dark:from-black dark:via-black/50 dark:to-black" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          {/* Title and Description */}
          <div className="space-y-6">
            <h1 className="text-[50px] leading-[1.1] font-serif tracking-[-0.02em]">
              Story Complete
            </h1>
            <p className="text-2xl text-black/60 dark:text-white/60">
              You've completed {story.title}!
            </p>
          </div>

          {/* Error Message if present */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Trophy className="w-8 h-8 mx-auto mb-4 text-black/40 dark:text-white/40" />
              <div className="text-3xl font-light">{story.stats.completions + 1}</div>
              <div className="text-sm text-black/60 dark:text-white/60 mt-1">Total Completions</div>
            </div>
            <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Clock className="w-8 h-8 mx-auto mb-4 text-black/40 dark:text-white/40" />
              <div className="text-3xl font-light">{story.stats.averagePlayTime}m</div>
              <div className="text-sm text-black/60 dark:text-white/60 mt-1">Average Time</div>
            </div>
            <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <BookOpen className="w-8 h-8 mx-auto mb-4 text-black/40 dark:text-white/40" />
              <div className="text-3xl font-light">{story.stats.plays + 1}</div>
              <div className="text-sm text-black/60 dark:text-white/60 mt-1">Total Plays</div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <Link
              href="/stories"
              className="flex items-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              More Stories
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 