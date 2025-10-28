import type { User } from 'firebase/auth';

export type Theme = 'light' | 'dark';

export type FirebaseUser = User;

export enum ClothingCategory {
  HAUT = 'Hauts',
  BAS = 'Bas',
  CHAUSSURES = 'Chaussures',
  ACCESSOIRE = 'Accessoires',
}

export interface ClothingItem {
  id: string; // Firestore document ID
  userId: string;
  name: string;
  image: string; // Firebase Storage URL
  category: ClothingCategory;
  color: string;
  style: string;
  matiere: string;
  setId?: string | null; // Optional: To group items that belong to a set
}

export interface Weather {
  condition: 'Ensoleillé' | 'Nuageux' | 'Pluvieux' | 'Neigeux';
  temperature: number; // in Celsius
}

export type Occasion = 'Décontracté' | 'Chic' | 'Formel';

export interface Outfit {
  id: string; // Firestore document ID or temporary generated ID
  userId: string;
  name:string;
  description: string;
  items: ClothingItem[];
  generatedImage?: string; // base64 string, optional now
  isGeneratingImage?: boolean; // To track loading state per card
  isSaved?: boolean; // To track if the outfit is saved by the user
}

export interface WardrobeAnalysis {
    suggestion: string;
    reasoning: string;
}
