
import React from 'react';
import type { Weather, Occasion, WardrobeAnalysis } from '../types';
import { SunIcon, CloudIcon, RainIcon, SnowIcon, SparklesIcon } from './icons';
import WardrobeAnalysisDisplay from './WardrobeAnalysis';


interface OutfitGeneratorProps {
  weather: Weather;
  onGenerate: () => void;
  isLoading: boolean;
  wardrobeSize: number;
  occasion: Occasion;
  setOccasion: (occasion: Occasion) => void;
  onAnalyze: () => void;
  analysis: WardrobeAnalysis | null;
  isAnalyzing: boolean;
}

const WeatherIcon: React.FC<{ condition: Weather['condition'] }> = ({ condition }) => {
  switch (condition) {
    case 'Ensoleillé': return <SunIcon className="w-8 h-8 text-amber-400" />;
    case 'Nuageux': return <CloudIcon className="w-8 h-8 text-gray-400" />;
    case 'Pluvieux': return <RainIcon className="w-8 h-8 text-blue-400" />;
    case 'Neigeux': return <SnowIcon className="w-8 h-8 text-white" />;
    default: return null;
  }
};

const OccasionButton: React.FC<{name: Occasion, selected: boolean, onClick: () => void}> = ({name, selected, onClick}) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${selected ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
    >
        {name}
    </button>
);


const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({ weather, onGenerate, isLoading, wardrobeSize, occasion, setOccasion, onAnalyze, analysis, isAnalyzing }) => {
  const canGenerate = !isLoading && wardrobeSize >= 3;

  return (
    <div className="space-y-4">
      <WardrobeAnalysisDisplay 
        onAnalyze={onAnalyze}
        analysis={analysis}
        isAnalyzing={isAnalyzing}
        wardrobeSize={wardrobeSize}
      />
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <WeatherIcon condition={weather.condition} />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Météo du jour</p>
                    <p className="text-gray-500 dark:text-gray-400">{weather.condition}, {weather.temperature}°C</p>
                  </div>
              </div>
               <div className="flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Occasion</p>
                   <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <OccasionButton name="Décontracté" selected={occasion === 'Décontracté'} onClick={() => setOccasion('Décontracté')} />
                      <OccasionButton name="Chic" selected={occasion === 'Chic'} onClick={() => setOccasion('Chic')} />
                      <OccasionButton name="Formel" selected={occasion === 'Formel'} onClick={() => setOccasion('Formel')} />
                   </div>
              </div>
          </div>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full flex justify-center items-center gap-3 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-md hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-black disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900"
        >
          {isLoading ? (
              <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                  <span>Génération en cours...</span>
              </>
          ) : (
               <>
                  <SparklesIcon className="w-6 h-6" />
                  <span>Suggérer des tenues</span>
               </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OutfitGenerator;
