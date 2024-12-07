"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Story, getStories, deleteStory, createStory, getSceneCount } from '@/lib/stories';

interface CreateStoryDialogProps {
  onClose: () => void;
  onSubmit: (data: { title: string; author: string }) => Promise<void>;
  isOpen: boolean;
}

function CreateStoryDialog({ onClose, onSubmit, isOpen }: CreateStoryDialogProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit({ title, author });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-medium mb-4">Create New Story</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/90 dark:hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StoriesManagement() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await getStories();
      setStories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load stories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStory = async (data: { title: string; author: string }) => {
    try {
      await createStory({
        title: data.title,
        author: data.author,
        description: 'A new interactive story',
        coverImage: '/stories/default.jpg',
        category: 'Cyberpunk',
        tags: ['New'],
        stats: {
          rating: 0,
          plays: 0,
          completions: 0,
          averagePlayTime: 0,
        },
        config: {
          startScene: 'start',
          defaultVariables: {},
        },
        scenes: {},
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          estimatedReadTime: 0,
          difficulty: 'Medium',
          genre: ['Other'],
          isPublished: false,
        }
      });
      await loadStories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    setDeleteInProgress(id);
    try {
      await deleteStory(id);
      await loadStories();
    } catch (err) {
      console.error(err);
      alert('Failed to delete story');
    } finally {
      setDeleteInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/60 dark:text-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-light">Story Management</h1>
          <button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Story</span>
          </button>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
            {error}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 text-black/60 dark:text-white/60">
            No stories found. Create your first story to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div 
                key={story.id}
                className="group p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-medium">{story.title}</h2>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      by {story.author} • {getSceneCount(story)} scenes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/stories/${story.id}/edit`}
                      className="p-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      disabled={deleteInProgress === story.id}
                      className="p-2 text-black/60 dark:text-white/60 hover:text-red-500 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors disabled:opacity-50"
                    >
                      {deleteInProgress === story.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                    <Link
                      href={`/admin/stories/${story.id}`}
                      className="p-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateStoryDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateStory}
      />
    </div>
  );
} 