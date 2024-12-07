"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/types/story';

// Example stories (later to be fetched from an API/database)
const stories: Story[] = [
  {
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
        trust: { value: 0 },
        knowledge: { value: 0 },
      },
    },
    scenes: {}, // Scenes would be loaded separately
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
  {
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
        honor: { value: 0 },
        influence: { value: 0 },
      },
    },
    scenes: {}, // Scenes would be loaded separately
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
];

export default function StoriesPage() {
  // Group stories by category
  const storiesByCategory = stories.reduce((acc, story) => {
    const category = story.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white px-4 pt-32">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto space-y-24">
        {/* Title Section */}
        <div className="space-y-3 text-center">
          <h1 className="text-[80px] leading-[1.1] font-serif tracking-[-0.02em]">
            Interactive Stories
          </h1>
          <p className="text-[20px] text-zinc-500 dark:text-[#8F9BA8] leading-relaxed">
            One app for many stories. Choose your path through carefully crafted narratives<br />
            that adapt to your choices.
          </p>
        </div>

        {/* Stories Sections */}
        <div className="space-y-16">
          {Object.entries(storiesByCategory).map(([category, categoryStories]) => (
            <section key={category} className="space-y-6">
              <h2 className="text-[13px] font-medium text-zinc-500 dark:text-[#8F9BA8] tracking-[0.1em] uppercase">
                {category}
              </h2>

              <div className="flex flex-wrap gap-4">
                {categoryStories.map(story => (
                  <Link
                    key={story.id}
                    href={`/story/${story.id}`}
                    className="group relative isolate"
                  >
                    {/* Hover Effects */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                      bg-gradient-to-r from-zinc-100 dark:from-white/[0.03] to-transparent blur-xl -z-10" />
                    
                    <div className="relative flex items-center px-8 py-4 rounded-full 
                      border border-zinc-200 dark:border-white/[0.08]
                      hover:border-zinc-300 dark:hover:border-white/[0.16] 
                      hover:bg-zinc-50 dark:hover:bg-white/[0.02] 
                      transition-all duration-500 ease-out
                      group-hover:scale-[1.01] group-hover:-translate-y-0.5">
                      <h3 className="text-[28px] font-normal text-zinc-800 dark:text-[#E8E8E8] 
                        group-hover:text-black dark:group-hover:text-white transition-colors">
                        {story.title}
                      </h3>
                      <svg 
                        className="w-5 h-5 ml-6 text-zinc-400 dark:text-white/40 
                          group-hover:text-zinc-900 dark:group-hover:text-white 
                          group-hover:translate-x-0.5 transition-all duration-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
                
                {/* More Coming Soon Pill */}
                <div className="group relative isolate">
                  {/* Hover Effects */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                    bg-gradient-to-r from-zinc-100 dark:from-white/[0.03] to-transparent blur-xl -z-10" />
                  
                  <div className="relative flex items-center px-8 py-4 rounded-full cursor-default
                    border border-zinc-200 dark:border-white/[0.08]
                    hover:border-zinc-300 dark:hover:border-white/[0.16] 
                    hover:bg-zinc-50 dark:hover:bg-white/[0.02]
                    transition-all duration-500 ease-out
                    group-hover:scale-[1.01] group-hover:-translate-y-0.5">
                    <span className="text-[28px] font-normal text-zinc-400 dark:text-[#8F9BA8]">
                      More coming soon
                    </span>
                    <svg 
                      className="w-5 h-5 ml-6 text-zinc-300 dark:text-white/40 transition-transform duration-500
                        group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
} 