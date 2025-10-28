

import React, { useState, useRef } from 'react';
import type { ClothingItem } from '../types';
import { analyzeClothingItem } from '../services/geminiService';
import { CameraIcon, SparklesIcon, XIcon } from './icons';

interface ImageUploaderProps {
  onAddMultipleClothing: (items: { analysis: Omit<ClothingItem, 'id' | 'image' | 'userId'>; image: string }[]) => Promise<void>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onAddMultipleClothing }) => {
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const newFilesArray = Array.from(files);

    const fileReadPromises = newFilesArray.map(file => {
      return new Promise<{ file: File; preview: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ file, preview: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReadPromises).then(newFilesWithPreviews => {
      setSelectedFiles(prev => [...prev, ...newFilesWithPreviews]);
    });
    
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearSelection = () => {
    setSelectedFiles([]);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    const analysisPromises = selectedFiles.map(item => 
      analyzeClothingItem(item.preview, item.file.type)
    );

    const results = await Promise.allSettled(analysisPromises);
    
    const successfulItems: { analysis: Omit<ClothingItem, 'id' | 'image' | 'userId'>; image: string }[] = [];
    let failedCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulItems.push({
          analysis: result.value,
          image: selectedFiles[index].preview,
        });
      } else {
        failedCount++;
        console.error(`Analysis failed for file ${selectedFiles[index].file.name}:`, result.reason);
      }
    });

    if (successfulItems.length > 0) {
      await onAddMultipleClothing(successfulItems);
    }
    
    if (failedCount > 0) {
      setError(`${failedCount} analyse(s) ont échoué. Les autres ont été ajoutées.`);
    }

    setSelectedFiles([]);
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un vêtement</h2>

      {selectedFiles.length > 0 && (
         <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {selectedFiles.map((item, index) => (
                <div key={index} className="relative group aspect-square">
                    <img src={item.preview} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                    <button 
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
                        aria-label="Supprimer l'image"
                    >
                        <XIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
        </div>
      )}

      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center cursor-pointer hover:border-amber-500 dark:hover:border-amber-400 transition-colors"
        onClick={triggerFileInput}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        <div className="space-y-2">
            <CameraIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
             {selectedFiles.length > 0 
                ? "Ajouter d'autres fichiers" 
                : <>Utiliser la <span className="font-semibold text-amber-600 dark:text-amber-400">caméra</span> ou <span className="font-semibold text-amber-600 dark:text-amber-400">choisir des fichiers</span></>
              }
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG jusqu'à 5Mo</p>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
            <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-black disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900"
            >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyse en cours...</span>
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5 text-amber-400" />
                    <span>Analyser et ajouter ({selectedFiles.length})</span>
                </>
            )}
            </button>
             <button onClick={handleClearSelection} className="w-full text-xs text-center text-gray-500 hover:underline">
                Vider la sélection
            </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default ImageUploader;
