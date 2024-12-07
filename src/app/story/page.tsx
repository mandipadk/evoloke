"use client"

import { useState } from 'react';

interface Choice {
  text: string;
  nextScene: string;
}

interface Scene {
  content: string;
  choices: Choice[];
}

const story: Record<string, Scene> = {
  start: {
    content: "The morning sun filters through your window, casting long shadows across your desk. Your computer screen flickers to life, displaying a mysterious message: 'Your story begins now.'",
    choices: [
      { text: "Read the message carefully", nextScene: "read_message" },
      { text: "Check if anyone else received it", nextScene: "check_others" }
    ]
  },
  read_message: {
    content: "As you lean closer to the screen, the text begins to shift and change, revealing more: 'The choices you make here will echo through the digital realm. Choose wisely.'",
    choices: [
      { text: "Reply to the message", nextScene: "reply" },
      { text: "Try to trace its origin", nextScene: "trace" }
    ]
  },
  // Add more scenes as needed
};

export default function StoryPage() {
  const [currentScene, setCurrentScene] = useState('start');
  const [fadeOut, setFadeOut] = useState(false);
  const [history, setHistory] = useState<string[]>(['start']);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const handleChoice = (nextScene: string, choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
    setFadeOut(true);
    setTimeout(() => {
      setCurrentScene(nextScene);
      setHistory([...history, nextScene]);
      setFadeOut(false);
      setSelectedChoice(null);
    }, 500);
  };

  const handleBack = () => {
    if (history.length > 1) {
      setFadeOut(true);
      setTimeout(() => {
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);
        setCurrentScene(newHistory[newHistory.length - 1]);
        setFadeOut(false);
      }, 500);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-white dark:from-black dark:via-black/50 dark:to-black" />

      {/* Story content */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-3xl mx-auto w-full">
        {/* Navigation */}
        <div className="w-full flex justify-between items-center mb-12 animate-in fade-in duration-700">
          <button
            onClick={handleBack}
            className={`px-4 py-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors ${history.length <= 1 ? 'opacity-0' : 'opacity-100'}`}
            disabled={history.length <= 1}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Previous
            </span>
          </button>
          <div className="h-1 flex-1 mx-8">
            <div className="h-full w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full transition-all duration-500"
                style={{ width: `${(history.length / Object.keys(story).length) * 100}%` }}
              />
            </div>
          </div>
          <span className="px-4 py-2 text-sm text-black/60 dark:text-white/60">
            {history.length}/{Object.keys(story).length}
          </span>
        </div>

        {/* Story text */}
        <div 
          className={`w-full space-y-8 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <p className="text-lg md:text-xl text-black/80 dark:text-white/80 font-light leading-relaxed">
            {story[currentScene].content}
          </p>

          {/* Choices */}
          <div className="space-y-3 pt-8">
            {story[currentScene].choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice.nextScene, index)}
                disabled={fadeOut}
                className={`
                  group relative w-full p-6 text-left 
                  text-black/60 dark:text-white/60 
                  hover:text-black dark:hover:text-white 
                  transition-all duration-300
                  ${selectedChoice === index ? 'scale-[0.98]' : 'scale-100'}
                  disabled:opacity-50
                `}
              >
                {/* Number indicator */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-12 text-center text-sm text-black/40 dark:text-white/40 font-light">
                  0{index + 1}
                </span>

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
        </div>
      </main>
    </div>
  );
} 