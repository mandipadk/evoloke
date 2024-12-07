"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import readingIllustration from "@/assets/reading.svg";

export default function Home() {
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!illustrationRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX - innerWidth / 2) / innerWidth * 20;
      const moveY = (clientY - innerHeight / 2) / innerHeight * 20;
      
      illustrationRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-white dark:from-black dark:via-black/50 dark:to-black" />

      {/* Main content */}
      <main className="relative flex-1 flex items-center justify-center p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full items-center">
          {/* Text content */}
          <div className="space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight">
                <span className="bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent animate-in fade-in duration-700 fill-mode-forwards">
                  Evoloke
                </span>
              </h1>
              <p className="text-3xl md:text-4xl lg:text-5xl text-black/80 dark:text-white/80 font-light tracking-tight animate-in fade-in duration-700 delay-300 fill-mode-forwards">
                Interactive Stories
              </p>
            </div>

            <p className="text-lg md:text-xl text-black/60 dark:text-white/60 font-light max-w-xl animate-in fade-in duration-700 delay-500 fill-mode-forwards">
              Crafting immersive narratives where your choices shape unique storylines, 
              <span className="text-black dark:text-white"> enhancing your storytelling experience.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-700 fill-mode-forwards">
              <Link
                href="/story"
                className="group relative inline-flex items-center justify-center px-8 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-black transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 dark:from-neutral-200 dark:via-neutral-100 dark:to-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center">
                  Begin Journey
                  <svg
                    className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
              <Link
                href="/stories"
                className="group relative inline-flex items-center justify-center px-8 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-black dark:text-white transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="relative flex items-center">
                  Explore Stories
                </span>
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative aspect-square w-full max-w-xl mx-auto animate-in fade-in slide-in-from-right duration-1000 delay-300 fill-mode-forwards">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-400/10 via-neutral-400/5 to-neutral-500/10 rounded-[40px] blur-3xl" />
            <div 
              ref={illustrationRef}
              className="relative w-full h-full rounded-3xl overflow-hidden flex items-center justify-center p-8 transition-transform duration-[250ms] ease-out"
            >
              <Image
                src={readingIllustration}
                alt="Reading illustration"
                className="w-full h-full object-contain dark:invert"
                width={500}
                height={500}
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-between items-end px-4 md:px-8 animate-in fade-in slide-in-from-bottom duration-700 delay-1000 fill-mode-forwards">
          <Link 
            href="mailto:contact@evoloke.com" 
            className="group relative px-4 py-2 text-base md:text-lg text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-300"
          >
            contact@evoloke.com
            <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-400/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Link>
          <p className="text-base md:text-lg text-black/60 dark:text-white/60">A new way to experience stories</p>
        </div>
      </main>
    </div>
  );
}
