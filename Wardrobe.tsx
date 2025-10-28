import React, { useState, useMemo } from 'react';
import type { ClothingItem } from './types.ts';
import { ClothingCategory } from './types.ts';
import { ChevronDownIcon, ShirtIcon, PantIcon, ShoeIcon, AccessoryIcon, TrashIcon, LinkIcon, CheckCircleIcon } from './icons.tsx';

interface WardrobeProps {
  wardrobe: ClothingItem[];
  onDeleteItem: (id: string) => void;
  onCreateSet: (itemIds: string[]) => void;
  onBreakSet: (setId: string) => void;
}

const categoryIcons: Record<ClothingCategory, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [ClothingCategory.HAUT]: ShirtIcon,
  [ClothingCategory.BAS]: PantIcon,
  [ClothingCategory.CHAUSSURES]: ShoeIcon,
  [ClothingCategory.ACCESSOIRE]: AccessoryIcon,
};

const Wardrobe: React.FC<WardrobeProps> = ({ wardrobe, onDeleteItem, onCreateSet, onBreakSet }) => {
  const [openCategory, setOpenCategory] = useState<ClothingCategory | null>(ClothingCategory.HAUT);
  const [colorFilter, setColorFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hoveredSetId, setHoveredSetId] = useState<string | null>(null);

  const itemsByCategory = useMemo(() => {
    return wardrobe.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<ClothingCategory, ClothingItem[]>);
  }, [wardrobe]);

  const toggleCategory = (category: ClothingCategory) => {
    if (openCategory === category) {
      setOpenCategory(null);
    } else {
      setOpenCategory(category);
      setColorFilter('');
      setMaterialFilter('');
    }
  };
  
  const filteredItems = useMemo(() => {
    if (!openCategory || !itemsByCategory[openCategory]) return [];
    return itemsByCategory[openCategory].filter(item => 
      (colorFilter ? item.color === colorFilter : true) &&
      (materialFilter ? item.matiere === materialFilter : true)
    );
  }, [openCategory, itemsByCategory, colorFilter, materialFilter]);

  const availableColors = useMemo(() => {
    if (!openCategory || !itemsByCategory[openCategory]) return [];
    return [...new Set(itemsByCategory[openCategory].map(item => item.color))];
  }, [openCategory, itemsByCategory]);

  const availableMaterials = useMemo(() => {
    if (!openCategory || !itemsByCategory[openCategory]) return [];
    return [...new Set(itemsByCategory[openCategory].map(item => item.matiere))];
  }, [openCategory, itemsByCategory]);
  
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleCreateSetClick = () => {
    onCreateSet(selectedItems);
    setSelectionMode(false);
    setSelectedItems([]);
  };
  
  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ma Garde-Robe ({wardrobe.length})</h2>
        {!selectionMode && (
          <button onClick={() => setSelectionMode(true)} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            Créer un ensemble
          </button>
        )}
      </div>

      {selectionMode && (
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-md space-y-2">
            <p className="text-xs text-center text-amber-800 dark:text-amber-200">Sélectionnez au moins 2 articles à lier.</p>
            <div className="flex gap-2">
                <button onClick={handleCreateSetClick} disabled={selectedItems.length < 2} className="w-full text-xs px-2 py-1 bg-gray-800 text-white font-semibold rounded-md hover:bg-black disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Valider l'ensemble
                </button>
                <button onClick={handleCancelSelection} className="w-full text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100">
                    Annuler
                </button>
            </div>
        </div>
      )}
      
      {wardrobe.length === 0 ? (
         <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
             <p className="text-gray-500 dark:text-gray-400">Votre garde-robe est vide.</p>
             <p className="text-sm text-gray-400 dark:text-gray-500">Ajoutez des vêtements pour commencer !</p>
        </div>
      ) : (
        <div className="space-y-1">
            {Object.values(ClothingCategory).map((category) => {
                const CategoryIcon = categoryIcons[category];
                const items = itemsByCategory[category] || [];
                const isOpen = openCategory === category;

                return (
                    <div key={category} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                        <button 
                            onClick={() => toggleCategory(category)}
                            className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-md transition-colors"
                            aria-expanded={isOpen}
                        >
                            <div className="flex items-center gap-3">
                                <CategoryIcon className="w-6 h-6 text-amber-500"/>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{category}</span>
                                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">{items.length}</span>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && items.length > 0 && (
                            <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-b-md">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500" aria-label="Filtrer par couleur">
                                        <option value="">Toutes les couleurs</option>
                                        {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500" aria-label="Filtrer par matière">
                                        <option value="">Toutes les matières</option>
                                        {availableMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                
                                {filteredItems.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                                        {filteredItems.map((item) => {
                                            const isSelected = selectedItems.includes(item.id);
                                            const isInHoveredSet = hoveredSetId && item.setId === hoveredSetId;
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className={`relative group aspect-square cursor-pointer ${selectionMode ? 'p-0.5' : ''}`}
                                                    onClick={selectionMode ? () => toggleItemSelection(item.id) : undefined}
                                                    onMouseEnter={() => item.setId && setHoveredSetId(item.setId)}
                                                    onMouseLeave={() => item.setId && setHoveredSetId(null)}
                                                >
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                                    <div className={`absolute inset-0 rounded-md transition-all duration-200 ${isSelected ? 'ring-2 ring-amber-500 ring-inset' : ''} ${isInHoveredSet ? 'ring-2 ring-amber-400/70 ring-inset' : ''}`}></div>
                                                    {!selectionMode && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none">
                                                            <p className="text-xs font-bold truncate">{item.name}</p>
                                                        </div>
                                                    )}
                                                    {!selectionMode && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                                                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 z-10"
                                                            aria-label={`Supprimer ${item.name}`}
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                     {item.setId && !selectionMode && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onBreakSet(item.setId!); }}
                                                            className="absolute top-1 left-1 bg-gray-800/80 hover:bg-black text-amber-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 z-10"
                                                            aria-label="Dissocier l'ensemble"
                                                            title="Dissocier l'ensemble"
                                                        >
                                                            <LinkIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {selectionMode && isSelected && (
                                                        <div className="absolute top-1 right-1 bg-amber-500 rounded-full text-white z-10">
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Aucun article ne correspond.</p>
                                )}
                            </div>
                        )}
                         {isOpen && items.length === 0 && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 px-3 bg-gray-50 dark:bg-black/20 rounded-b-md">Aucun article dans cette catégorie.</p>
                         )}
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default Wardrobe;