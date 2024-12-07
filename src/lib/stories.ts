import type { Story as BaseStory, Scene, StoryCategory } from '@/types/story';
export type { Scene };

// Extend the base Story type with additional properties
export interface Story extends BaseStory {
  sceneOrder?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for development
// TODO: Replace with database in production
let stories: Record<string, Story> = {};

// Initialize with existing stories
import { digitalWhispersScenes } from '@/data/stories/digital-whispers';
import { crownOfDestinyScenes } from '@/data/stories/crown-of-destiny';

// Initialize with sample stories
stories = {
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
      }
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
    },
    createdAt: new Date(),
    updatedAt: new Date(),
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
      }
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
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export async function getStories(): Promise<Story[]> {
  return Object.values(stories).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getStory(id: string): Promise<Story | null> {
  return stories[id] || null;
}

export async function createStory(data: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'scenes'> & { scenes?: Record<string, Scene> }): Promise<Story> {
  const id = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  if (stories[id]) {
    throw new Error('A story with this title already exists');
  }

  const now = new Date();
  const story: Story = {
    ...data,
    id,
    scenes: data.scenes || {},
    createdAt: now,
    updatedAt: now,
  };

  stories[id] = story;
  return story;
}

export async function updateStory(id: string, data: Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Story> {
  const story = stories[id];
  if (!story) {
    throw new Error('Story not found');
  }

  const updatedStory: Story = {
    ...story,
    ...data,
    id, // Ensure ID doesn't change
    updatedAt: new Date(),
  };

  stories[id] = updatedStory;
  return updatedStory;
}

export async function deleteStory(id: string): Promise<void> {
  if (!stories[id]) {
    throw new Error('Story not found');
  }

  delete stories[id];
}

// Scene-specific operations
export async function createScene(
  storyId: string, 
  sceneId: string, 
  data: Omit<Scene, 'id'>
): Promise<Scene> {
  const story = stories[storyId];
  if (!story) {
    throw new Error('Story not found');
  }

  if (story.scenes[sceneId]) {
    throw new Error('A scene with this ID already exists');
  }

  const scene: Scene = {
    ...data,
    id: sceneId,
  };

  story.scenes[sceneId] = scene;
  story.updatedAt = new Date();
  return scene;
}

export async function updateScene(
  storyId: string,
  sceneId: string,
  data: Partial<Omit<Scene, 'id'>>
): Promise<Scene> {
  const story = stories[storyId];
  if (!story) {
    throw new Error('Story not found');
  }

  const scene = story.scenes[sceneId];
  if (!scene) {
    throw new Error('Scene not found');
  }

  const updatedScene: Scene = {
    ...scene,
    ...data,
    id: sceneId, // Ensure ID doesn't change
  };

  story.scenes[sceneId] = updatedScene;
  story.updatedAt = new Date();
  return updatedScene;
}

export async function deleteScene(storyId: string, sceneId: string): Promise<void> {
  const story = stories[storyId];
  if (!story) {
    throw new Error('Story not found');
  }

  if (!story.scenes[sceneId]) {
    throw new Error('Scene not found');
  }

  delete story.scenes[sceneId];
  story.updatedAt = new Date();
}

// Utility function to get scene count
export function getSceneCount(story: Story): number {
  return Object.keys(story.scenes).length;
}

export async function updateSceneOrder(storyId: string, sceneOrder: string[]): Promise<Story> {
  const story = stories[storyId];
  if (!story) {
    throw new Error('Story not found');
  }

  story.sceneOrder = sceneOrder;
  story.updatedAt = new Date();
  return story;
} 