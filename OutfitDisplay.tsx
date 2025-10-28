import React from 'react';
import type { Outfit } from './types.ts';
import { SparklesIcon, HeartIcon } from './icons.tsx';

interface OutfitDisplayProps {
  outfits: Outfit[];
  isLoading: boolean;
  error: string | null;
  onGenerateImage: (outfitId: string) => void;
  onSaveOutfit: (outfitId: string) => void;
  onUnsaveOutfit: (outfitId: string) => void;
}

const OutfitCard: React.FC<{ outfit: Outfit; onGenerateImage: (id: string) => void; onSave: (id: string) => void; onUnsave: (id: string) => void; }> = ({ outfit, onGenerateImage, onSave, onUnsave }) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col">
    <div className="relative aspect-square w-full group">
      {outfit.generatedImage ? (
        <img src={outfit.generatedImage} alt={outfit.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100 dark:bg-black/20 flex flex-col items-center justify-center p-4 text-center">
            {outfit.isGeneratingImage ? (
                <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    <p className="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Création du rendu...</p>
                </>
            ) : (
                <>
                    <SparklesIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Prêt à visualiser ?</h4>
                    <button 
                        onClick={() => onGenerateImage(outfit.id)}
                        className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900"
                    >
                        Générer le rendu
                    </button>
                </>
            )}
        </div>
      )}
       <button
        onClick={() => (outfit.isSaved ? onUnsave(outfit.id) : onSave(outfit.id))}
        className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all scale-0 group-hover:scale-100 focus:scale-100"
        aria-label={outfit.isSaved ? 'Retirer des favoris' : 'Sauvegarder la tenue'}
       >
        <HeartIcon className={`w-5 h-5 ${outfit.isSaved ? 'text-red-500 fill-current' : ''}`} />
      </button>
    </div>
    <div className="p-4 flex-grow flex flex-col">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{outfit.name}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex-grow">{outfit.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {outfit.items.map(item => (
          <div key={item.id} title={item.name} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
            <img src={item.image} alt={item.name} className="w-5 h-5 rounded-full object-cover"/>
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-24">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);


const SkeletonCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800"></div>
        <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
            <div className="flex flex-wrap gap-2 pt-2">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
    </div>
);


const OutfitDisplay: React.FC<OutfitDisplayProps> = ({ outfits, isLoading, error, onGenerateImage, onSaveOutfit, onUnsaveOutfit }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tenues Suggérées</h2>
      {error && (
        <div className="bg-red-100/10 border border-red-400/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-md" role="alert">
          <p className="font-bold">Oups ! Une erreur est survenue.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading && !error && outfits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} onGenerateImage={onGenerateImage} onSave={onSaveOutfit} onUnsave={onUnsaveOutfit} />
          ))}
        </div>
      )}

      {!isLoading && !error && outfits.length === 0 && (
         <div className="text-center py-16 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
             <SparklesIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" />
             <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Prêt pour un peu d'inspiration ?</h3>
             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choisissez une occasion et cliquez sur "Suggérer des tenues".</p>
        </div>
      )}
    </div>
  );
};

export default OutfitDisplay;