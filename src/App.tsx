import React, { useState, useEffect, useCallback } from 'react';
import type { ClothingItem, Outfit, Weather, Theme, Occasion, WardrobeAnalysis, FirebaseUser } from './types';
import { generateOutfits, generateOutfitImage, analyzeWardrobeGaps } from './services/geminiService';
import * as firestoreService from './services/firestoreService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Wardrobe from './components/Wardrobe';
import OutfitGenerator from './components/OutfitGenerator';
import OutfitDisplay from './components/OutfitDisplay';
import SavedOutfits from './components/SavedOutfits';

interface AppProps {
  user: FirebaseUser;
  onSignOut: () => void;
}

const App: React.FC<AppProps> = ({ user, onSignOut }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [weather, setWeather] = useState<Weather>({ condition: 'Ensoleillé', temperature: 22 });
  const [occasion, setOccasion] = useState<Occasion>('Décontracté');

  const [wardrobeAnalysis, setWardrobeAnalysis] = useState<WardrobeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch initial data from Firestore
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [userWardrobe, userSavedOutfits] = await Promise.all([
          firestoreService.getWardrobe(user.uid),
          firestoreService.getSavedOutfits(user.uid)
        ]);
        setWardrobe(userWardrobe);
        setSavedOutfits(userSavedOutfits);
      } catch (e) {
        console.error("Erreur lors du chargement des données:", e);
        setError("Impossible de charger vos données. Veuillez rafraîchir la page.");
      } finally {
        setIsDataLoading(false);
      }
    };
    loadData();
  }, [user.uid]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#f9fafb';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleAddMultipleClothing = async (itemsData: { analysis: Omit<ClothingItem, 'id' | 'image' | 'userId'>; image: string }[]) => {
    const newItems: ClothingItem[] = [];
    for (const data of itemsData) {
      const newItem = await firestoreService.addClothingItem(user.uid, data.analysis, data.image);
      newItems.push(newItem);
    }
    setWardrobe(prev => [...prev, ...newItems]);
  };

  const handleDeleteClothing = async (id: string) => {
    const itemToDelete = wardrobe.find(item => item.id === id);
    if (!itemToDelete) return;
    try {
      await firestoreService.deleteClothingItem(id, itemToDelete.image);
      setWardrobe(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Erreur lors de la suppression:", e);
      setError("Impossible de supprimer l'article.");
    }
  };
  
  const handleCreateSet = async (itemIds: string[]) => {
    const setId = `set-${Date.now()}`;
    await firestoreService.updateItemsSetId(itemIds, setId);
    setWardrobe(currentWardrobe => 
      currentWardrobe.map(item => 
        itemIds.includes(item.id) ? { ...item, setId } : item
      )
    );
  };

  const handleBreakSet = async (setId: string) => {
    const itemsToUpdate = wardrobe.filter(item => item.setId === setId).map(item => item.id);
    await firestoreService.updateItemsSetId(itemsToUpdate, null);
    setWardrobe(currentWardrobe => 
      currentWardrobe.map(item => {
        if (item.setId === setId) {
          const { setId: _, ...rest } = item;
          return rest;
        }
        return item;
      })
    );
  };

  const handleGenerateOutfits = useCallback(async () => {
    if (wardrobe.length < 3) {
      setError("Veuillez ajouter au moins 3 articles à votre garde-robe pour générer des tenues.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedOutfits([]);

    try {
      const outfitSuggestions = await generateOutfits(wardrobe, weather, occasion);
      const outfits: Outfit[] = outfitSuggestions.map((suggestion, index) => ({
        id: `gen-${Date.now() + index}`,
        userId: user.uid,
        name: suggestion.name,
        description: suggestion.description,
        items: suggestion.item_ids.map(id => wardrobe.find(item => item.id === id)).filter(Boolean) as ClothingItem[],
        isSaved: savedOutfits.some(so => so.name === suggestion.name), // Basic check to avoid duplicate saves
      }));
      setGeneratedOutfits(outfits);
    } catch (e) {
      console.error(e);
      setError("Désolé, une erreur est survenue lors de la suggestion de tenues. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [wardrobe, weather, occasion, savedOutfits, user.uid]);

  const handleGenerateImageForOutfit = async (outfitId: string) => {
    const outfitIndex = generatedOutfits.findIndex(o => o.id === outfitId);
    if (outfitIndex === -1) return;

    setGeneratedOutfits(currentOutfits => 
      currentOutfits.map(o => o.id === outfitId ? { ...o, isGeneratingImage: true } : o)
    );

    try {
      const outfitToRender = generatedOutfits[outfitIndex];
      const generatedImage = await generateOutfitImage(outfitToRender.items);
      
      setGeneratedOutfits(currentOutfits => 
        currentOutfits.map(o => o.id === outfitId ? { ...o, generatedImage, isGeneratingImage: false } : o)
      );

    } catch (e) {
      console.error("Erreur lors de la génération de l'image :", e);
       setGeneratedOutfits(currentOutfits => 
        currentOutfits.map(o => o.id === outfitId ? { ...o, isGeneratingImage: false } : o)
      );
    }
  };
  
  const handleSaveOutfit = async (outfitId: string) => {
    const outfitToSave = generatedOutfits.find(o => o.id === outfitId);
    if (outfitToSave && !savedOutfits.some(so => so.name === outfitToSave.name)) {
      const savedOutfit = await firestoreService.saveOutfit(user.uid, outfitToSave);
      setSavedOutfits(prev => [...prev, savedOutfit]);
      setGeneratedOutfits(prev => prev.map(o => o.id === outfitId ? { ...o, isSaved: true } : o));
    }
  };

  const handleUnsaveOutfit = async (outfitId: string) => {
    await firestoreService.unsaveOutfit(outfitId);
    const unsavedOutfit = savedOutfits.find(o => o.id === outfitId);
    setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
    // Also update generated outfit if it's in the list
    if (unsavedOutfit) {
        setGeneratedOutfits(prev => prev.map(o => o.name === unsavedOutfit.name ? { ...o, isSaved: false } : o));
    }
  };

  const handleAnalyzeWardrobe = useCallback(async () => {
    setIsAnalyzing(true);
    setWardrobeAnalysis(null);
    try {
        const analysis = await analyzeWardrobeGaps(wardrobe);
        setWardrobeAnalysis(analysis);
    } catch(e) {
        console.error("Erreur lors de l'analyse de la garde-robe:", e);
        setWardrobeAnalysis({ 
            suggestion: "Analyse impossible", 
            reasoning: "Une erreur est survenue. Veuillez réessayer." 
        });
    } finally {
        setIsAnalyzing(false);
    }
  }, [wardrobe]);

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
        <p className="ml-4 text-gray-700 dark:text-gray-300">Chargement de votre garde-robe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} user={user} onSignOut={onSignOut} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <ImageUploader onAddMultipleClothing={handleAddMultipleClothing} />
            <Wardrobe 
              wardrobe={wardrobe} 
              onDeleteItem={handleDeleteClothing}
              onCreateSet={handleCreateSet}
              onBreakSet={handleBreakSet}
            />
             <SavedOutfits outfits={savedOutfits} onUnsave={handleUnsaveOutfit} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <OutfitGenerator
              weather={weather}
              onGenerate={handleGenerateOutfits}
              isLoading={isLoading}
              wardrobeSize={wardrobe.length}
              occasion={occasion}
              setOccasion={setOccasion}
              onAnalyze={handleAnalyzeWardrobe}
              analysis={wardrobeAnalysis}
              isAnalyzing={isAnalyzing}
            />
            <OutfitDisplay 
              outfits={generatedOutfits} 
              isLoading={isLoading} 
              error={error}
              onGenerateImage={handleGenerateImageForOutfit}
              onSaveOutfit={handleSaveOutfit}
              onUnsaveOutfit={handleUnsaveOutfit}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
