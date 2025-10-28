import React from 'react';
import type { Theme, FirebaseUser } from './types.ts';
import { SunIcon, MoonIcon, WardrobeIcon, LogoutIcon } from './icons.tsx';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  user: FirebaseUser;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, user, onSignOut }) => {
  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <WardrobeIcon className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Dresscode <span className="text-amber-500">AI</span>
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">
                    {user.displayName || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connecté</p>
            </div>
            <button
              onClick={onSignOut}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-white dark:focus:ring-offset-black transition-all"
              aria-label="Déconnexion"
            >
                <LogoutIcon className="w-6 h-6" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-white dark:focus:ring-offset-black transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;