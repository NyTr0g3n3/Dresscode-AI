import React from 'react';
import type { WardrobeAnalysis } from '../types';
import { LightbulbIcon } from './icons';

interface WardrobeAnalysisProps {
    onAnalyze: () => void;
    analysis: WardrobeAnalysis | null;
    isAnalyzing: boolean;
    wardrobeSize: number;
}

const WardrobeAnalysisDisplay: React.FC<WardrobeAnalysisProps> = ({ onAnalyze, analysis, isAnalyzing, wardrobeSize }) => {
    const canAnalyze = !isAnalyzing && wardrobeSize > 0;

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
                <LightbulbIcon className="w-6 h-6 text-amber-500"/>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Conseiller de Style IA</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Optimisez votre garde-robe.</p>
                </div>
            </div>
            
            {isAnalyzing ? (
                 <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                    <span>Analyse en cours...</span>
                </div>
            ) : analysis ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400">
                    <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">{analysis.suggestion}</p>
                    <p className="text-amber-800 dark:text-amber-300 text-xs mt-1">{analysis.reasoning}</p>
                </div>
            ) : null}

            <button
                onClick={onAnalyze}
                disabled={!canAnalyze}
                className="w-full text-sm px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-semibold rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {analysis ? "Analyser à nouveau" : "Analyser ma garde-robe"}
            </button>
        </div>
    );
};

export default WardrobeAnalysisDisplay;
