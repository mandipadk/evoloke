"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Moon, Sun, X } from 'lucide-react'
import { useTheme } from "next-themes"

const navItems = [
  { name: "Story", href: "/story" },
  { name: "Map", href: "/map" },
  { name: "Updates", href: "/updates" },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  
  return (
    <header className="sticky top-0 left-0 right-0 z-50 flex justify-center p-6">
      <nav className="flex items-center space-x-6">
        <Link 
          href="/" 
          className="flex items-center text-2xl font-light mr-4 transition-transform hover:scale-110"
          aria-label="Evoloke Home"
        >
          <span className="text-primary animate-pulse">✧</span>
        </Link>
        
        {isSearchOpen ? (
          <div className="flex items-center rounded-full bg-gray-100/90 px-4 backdrop-blur-sm dark:bg-gray-900/90 transition-all duration-300 ease-out">
            <Search className="h-5 w-5 text-foreground/80" />
            <input
              type="text"
              placeholder="Search Here"
              className="h-12 w-[500px] bg-transparent px-4 text-base font-light focus:outline-none transition-all duration-300 placeholder:text-foreground/50"
              autoFocus
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-foreground/80 hover:text-primary transition-all duration-200 hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center rounded-full bg-gray-100/90 px-3 backdrop-blur-sm dark:bg-gray-900/90 transition-all duration-300 ease-out hover:bg-gray-100/95 dark:hover:bg-gray-900/95">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative flex h-12 items-center px-5 text-base font-light
                  transition-all duration-300 ease-out
                  ${pathname === item.href 
                    ? 'text-foreground' 
                    : pathname !== '/' 
                      ? 'text-foreground/40 hover:text-foreground/80' 
                      : 'text-foreground/80 hover:text-foreground'
                  }
                `}
              >
                {item.name}
                <span className={`
                  absolute inset-x-[10%] -bottom-px h-px 
                  bg-gradient-to-r from-transparent via-foreground/50 to-transparent 
                  transition-all duration-300
                  ${pathname === item.href 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                  }
                `} />
              </Link>
            ))}
            
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`
                group relative flex h-12 items-center px-5 text-base font-light 
                transition-all duration-300 ease-out 
                ${pathname !== '/' 
                  ? 'text-foreground/40 hover:text-foreground/80' 
                  : 'text-foreground/80 hover:text-foreground'
                }
              `}
              aria-label="Open search"
            >
              Search
              <span className="absolute inset-x-[10%] -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/50 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </button>
            
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`
                group relative flex h-12 items-center px-5 text-base font-light 
                transition-all duration-300 ease-out
                ${pathname !== '/' 
                  ? 'text-foreground/40 hover:text-foreground/80' 
                  : 'text-foreground/80 hover:text-foreground'
                }
              `}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 hover:scale-110" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 hover:scale-110" />
              <span className="absolute inset-x-[10%] -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/50 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}

