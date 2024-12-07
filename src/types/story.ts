export interface StoryVariable {
  value: number;
  min?: number;
  max?: number;
  hidden?: boolean;
  displayName?: string;
}

export interface Choice {
  id: string;
  text: string;
  nextScene: string;
  consequences?: {
    variables?: Record<string, number>;
    achievements?: string[];
  };
  // For conditional choices
  conditions?: {
    requiredVariables?: Record<string, { min?: number; max?: number }>;
    requiredAchievements?: string[];
  };
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  choices?: Choice[];
  nextScene?: string;
  // For atmospheric elements
  atmosphere?: {
    mood?: 'neutral' | 'tense' | 'peaceful' | 'mysterious' | 'dramatic';
    music?: string;
    background?: string;
  };
  // For conditional content based on previous choices
  conditions?: {
    requiredVariables?: Record<string, { min?: number; max?: number }>;
    requiredAchievements?: string[];
  };
  // For dynamic content
  contentVariables?: {
    [key: string]: {
      defaultText: string;
      conditions: Array<{
        variables: Record<string, { min?: number; max?: number }>;
        text: string;
      }>;
    };
  };
}

// Story category types
export type StoryCategory = 'Cyberpunk' | 'Medieval';

export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: StoryCategory;
  tags: string[];
  // For story progress and stats
  stats: {
    rating: number;
    plays: number;
    completions: number;
    averagePlayTime: number;
  };
  // Story configuration
  config: {
    startScene: string;
    defaultVariables?: Record<string, StoryVariable>;
    achievements?: Array<{
      id: string;
      name: string;
      description: string;
      hidden?: boolean;
    }>;
    // For story branching
    endings?: Array<{
      id: string;
      name: string;
      description: string;
      conditions: {
        variables?: Record<string, { min?: number; max?: number }>;
        achievements?: string[];
      };
    }>;
  };
  // All scenes in the story
  scenes: Record<string, Scene>;
  // Story metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    estimatedReadTime: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    genre: string[];
    isPublished: boolean;
    // For content warnings and age ratings
    contentWarnings?: string[];
    ageRating?: 'Everyone' | 'Teen' | 'Mature';
  };
} 