"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Story, StoryVariable, Choice } from '@/types/story';
import { digitalWhispersScenes } from '@/data/stories/digital-whispers';
import { crownOfDestinyScenes } from '@/data/stories/crown-of-destiny';
import { X, Shield, BookOpen, Crown, Swords } from 'lucide-react';

// This would be replaced with an API call
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

interface GameState {
  variables: Record<string, StoryVariable>;
  currentScene: string;
  history: string[];
}

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    variables: {},
    currentScene: '',
    history: []
  });
  const [fadeOut, setFadeOut] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAttributes, setShowAttributes] = useState(false);

  useEffect(() => {
    const storyId = params.id as string;
    const loadedStory = getStory(storyId);
    
    if (!loadedStory) {
      router.push('/stories');
      return;
    }

    setStory(loadedStory);
    setGameState({
      variables: loadedStory.config.defaultVariables || {},
      currentScene: loadedStory.config.startScene,
      history: [loadedStory.config.startScene]
    });
  }, [params.id, router]);

  const handleChoice = (choiceId: string, nextScene: string) => {
    if (!story) return;

    setSelectedChoice(choiceId);
    setFadeOut(true);

    // Find the choice and apply its consequences
    const currentSceneData = story.scenes[gameState.currentScene];
    
    // Handle both choice-based and linear progression
    if (choiceId === 'continue') {
      // For scenes without choices, just move to the next scene
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentScene: nextScene,
          history: [...prev.history, nextScene]
        }));
        setFadeOut(false);
        setSelectedChoice(null);
      }, 500);
      return;
    }

    // For scenes with choices
    const choice = currentSceneData.choices?.find(c => c.id === choiceId);

    // Update variables if consequences exist
    if (choice?.consequences?.variables) {
      const consequences = choice.consequences.variables;
      setGameState(prev => ({
        ...prev,
        variables: Object.entries(consequences).reduce((acc, [key, delta]) => ({
          ...acc,
          [key]: {
            ...prev.variables[key],
            value: (prev.variables[key]?.value || 0) + delta
          }
        }), {...prev.variables})
      }));
    }

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene,
        history: [...prev.history, nextScene]
      }));
      setFadeOut(false);
      setSelectedChoice(null);
    }, 500);
  };

  const handleBack = () => {
    if (gameState.history.length > 1) {
      setFadeOut(true);
      setTimeout(() => {
        setGameState(prev => {
          const newHistory = prev.history.slice(0, -1);
          return {
            ...prev,
            history: newHistory,
            currentScene: newHistory[newHistory.length - 1]
          };
        });
        setFadeOut(false);
      }, 500);
    }
  };

  if (!story) return null;

  // If we've reached the end, redirect to the end page
  if (gameState.currentScene === 'end') {
    router.push(`/story/${params.id}/end`);
    return null;
  }

  const currentSceneData = story.scenes[gameState.currentScene];
  if (!currentSceneData) {
    console.error(`Scene ${gameState.currentScene} not found`);
    // Redirect to end page with error state
    router.push(`/story/${params.id}/end?error=Scene ${gameState.currentScene} is referenced but not found in the story.`);
    return null;
  }

  const choices = currentSceneData.choices ?? [];
  const hasChoices = choices.length > 0;

  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-white dark:from-black dark:via-black/50 dark:to-black" />

      {/* Story content */}
      <main className="relative flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Top Navigation Bar */}
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            {/* Progress */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className={`px-4 py-2 text-sm text-black/60 dark:text-white/60 transition-colors
                  ${gameState.history.length <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:text-black dark:hover:text-white'}`}
                disabled={gameState.history.length <= 1}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Previous
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-32 h-1">
                  <div className="h-full w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full transition-all duration-500"
                      style={{ width: `${(gameState.history.length / Object.keys(story.scenes).length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-black/60 dark:text-white/60">
                  {gameState.history.length}/{Object.keys(story.scenes).length}
                </span>
              </div>
            </div>

            {/* Attributes Button */}
            <button
              onClick={() => setShowAttributes(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 
                text-black/60 dark:text-white/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 
                transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="text-sm">Your attributes</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d={showAttributes ? "M6 18L18 6M6 6l12 12" : "M13 10V3L4 14h7v7l9-11h-7z"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Attributes Panel */}
        <div className={`fixed left-0 right-0 bottom-0 p-8 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg
          shadow-xl border-t border-neutral-200 dark:border-neutral-800
          transform transition-all duration-300 ease-out z-50
          ${showAttributes ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-black/90 dark:text-white/90">Story Attributes</h3>
              <button
                onClick={() => setShowAttributes(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5 text-black/60 dark:text-white/60" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Object.entries(gameState.variables)
                .filter(([_, variable]) => !variable.hidden)
                .map(([key, variable]) => {
                  // Calculate level description based on value
                  const getDescription = (value: number) => {
                    if (value <= 2) return "Novice";
                    if (value <= 4) return "Apprentice";
                    if (value <= 6) return "Adept";
                    if (value <= 8) return "Expert";
                    return "Master";
                  };
                  
                  // Get icon based on attribute
                  const getIcon = (key: string) => {
                    switch (key.toLowerCase()) {
                      case 'trust':
                        return <Shield className="w-5 h-5" />;
                      case 'knowledge':
                        return <BookOpen className="w-5 h-5" />;
                      case 'honor':
                        return <Crown className="w-5 h-5" />;
                      case 'influence':
                        return <Swords className="w-5 h-5" />;
                      default:
                        return null;
                    }
                  };

                  return (
                    <div key={key} className="group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-black/90 dark:bg-white/90 text-white dark:text-black text-sm rounded-lg px-3 py-2">
                          {key === 'trust' && "Your reputation for reliability and honesty"}
                          {key === 'knowledge' && "Your understanding of the world and its secrets"}
                          {key === 'honor' && "Your adherence to noble principles"}
                          {key === 'influence' && "Your ability to sway others"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-black/60 dark:text-white/60">{getIcon(key)}</span>
                            <span className="text-sm font-medium text-black/80 dark:text-white/80">
                              {variable.displayName || key}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-black/60 dark:text-white/60">
                              {getDescription(variable.value)}
                            </span>
                            <span className="text-sm font-medium tabular-nums w-8 text-right text-black/80 dark:text-white/80">
                              {variable.value}
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-neutral-500 to-neutral-400 dark:from-neutral-400 dark:to-neutral-500 rounded-full transition-all duration-500"
                            style={{ width: `${((variable.value - (variable.min || 0)) / ((variable.max || 10) - (variable.min || 0))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="mt-32 mb-12">
          {/* Story Title and Author */}
          <div className="text-center space-y-2 mb-12">
            <h1 className="text-[50px] leading-[1.1] font-serif tracking-[-0.02em]">
              {story.title}
            </h1>
            <p className="text-lg text-black/60 dark:text-white/60">
              by {story.author}
            </p>
          </div>

          {/* Story Text and Choices */}
          <div 
            className={`max-w-3xl mx-auto space-y-8 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
          >
            <p className="text-xl text-black/80 dark:text-white/80 font-light leading-relaxed">
              {currentSceneData.content}
            </p>

            {/* Choices or Continue */}
            {hasChoices ? (
              <div className="space-y-3 pt-8">
                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.id, choice.nextScene)}
                    disabled={fadeOut}
                    className={`
                      group relative w-full p-6 text-left 
                      text-black/60 dark:text-white/60 
                      hover:text-black dark:hover:text-white 
                      transition-all duration-300
                      ${selectedChoice === choice.id ? 'scale-[0.98]' : 'scale-100'}
                      disabled:opacity-50
                    `}
                  >
                    {/* Choice text */}
                    <span className="relative z-10 block pl-12">{choice.text}</span>

                    {/* Background and border */}
                    <div className="absolute inset-0 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700" />
                    <div className="absolute inset-[1px] rounded-[10px] bg-neutral-100 dark:bg-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Arrow indicator */}
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              currentSceneData.nextScene && (
                <button
                  onClick={() => handleChoice('continue', currentSceneData.nextScene!)}
                  disabled={fadeOut}
                  className="mt-8 w-full px-6 py-4 rounded-full bg-neutral-100 dark:bg-neutral-900 
                    text-black/60 dark:text-white/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 
                    transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100
                    flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 