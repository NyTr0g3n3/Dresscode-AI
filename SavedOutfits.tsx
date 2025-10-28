import React from 'react';
import type { Outfit } from './types.ts';
import { HeartIcon, TrashIcon } from './icons.tsx';

interface SavedOutfitsProps {
  outfits: Outfit[];
  onUnsave: (outfitId: string) => void;
}

const SavedOutfits: React.FC<SavedOutfitsProps> = ({ outfits, onUnsave }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 space-y-3">
      <div className="flex items-center gap-2">
        <HeartIcon className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tenues Sauvegardées ({outfits.length})</h2>
      </div>
      
      {outfits.length === 0 ? (
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
          Aucune tenue sauvegardée pour le moment.
        </p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {outfits.map(outfit => (
            <div key={outfit.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <img 
                src={outfit.generatedImage || outfit.items[0]?.image} 
                alt={outfit.name} 
                className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700"
              />
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">{outfit.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{outfit.items.length} article(s)</p>
              </div>
              <button 
                onClick={() => onUnsave(outfit.id)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500 transition-colors"
                aria-label={`Retirer ${outfit.name} des favoris`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOutfits;