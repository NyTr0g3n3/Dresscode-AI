import { GoogleGenAI, Type } from "@google/genai";
import type { ClothingItem, Outfit, Weather, Occasion, WardrobeAnalysis } from '../types';
import { ClothingCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType,
    },
  };
};

export const analyzeClothingItem = async (imageBase64: string, mimeType: string): Promise<Omit<ClothingItem, 'id' | 'image' | 'userId'>> => {
  const clothingSchema = {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'Un nom court et descriptif pour le vêtement (ex: "Veste en jean bleue").',
      },
      category: {
        type: Type.STRING,
        enum: Object.values(ClothingCategory),
        description: 'La catégorie du vêtement.',
      },
      color: {
        type: Type.STRING,
        description: "La couleur dominante de l'article.",
      },
      style: {
        type: Type.STRING,
        description: "Le style de l'article (ex: Casual, Formel, Sportif, Rock).",
      },
      matiere: {
        type: Type.STRING,
        description: "La matière principale du vêtement (ex: Coton, Denim, Cuir, Laine)."
      }
    },
    required: ['name', 'category', 'color', 'style', 'matiere'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [
        fileToGenerativePart(imageBase64, mimeType),
        { text: "Analyse cette image d'un vêtement et fournis ses détails au format JSON en te basant sur le schéma. Sois précis." },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: clothingSchema,
    }
  });
  
  const result = JSON.parse(response.text);

  if (Object.values(ClothingCategory).includes(result.category)) {
      return result as Omit<ClothingItem, 'id' | 'image' | 'userId'>;
  } else {
      console.warn(`Catégorie invalide "${result.category}" retournée par l'IA. Catégorie par défaut : Accessoire.`);
      return { ...result, category: ClothingCategory.ACCESSOIRE };
  }
};

export const generateOutfits = async (wardrobe: ClothingItem[], weather: Weather, occasion: Occasion): Promise<{ name: string; description: string; item_ids: string[] }[]> => {
  const outfitSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Un nom créatif et accrocheur pour la tenue (ex: 'Balade Urbaine Décontractée', 'Soirée Chic et Épurée').",
        },
        description: {
          type: Type.STRING,
          description: "Une courte description expliquant pourquoi cette tenue est adaptée à la météo et à l'occasion.",
        },
        item_ids: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "Une liste des IDs (string) des vêtements de la garde-robe qui composent cette tenue.",
        },
      },
      required: ['name', 'description', 'item_ids'],
    }
  };

  const wardrobeForPrompt = wardrobe.map(({ image, userId, ...rest }) => rest);

  const prompt = `
    Voici ma garde-robe virtuelle, au format JSON. Chaque article a un 'id' unique de type string:
    ${JSON.stringify(wardrobeForPrompt)}

    Les conditions sont :
    - Météo : ${weather.condition}, ${weather.temperature}°C
    - Occasion : ${occasion}

    **Règle importante :** Certains vêtements font partie d'un ensemble, identifié par un 'setId'. Si vous utilisez un vêtement avec un 'setId', vous DEVEZ OBLIGATOIREMENT inclure TOUS les autres vêtements ayant le même 'setId' dans la même tenue. Ne séparez jamais les articles d'un même ensemble.

    Crée 3 tenues complètes, cohérentes et stylées adaptées à ces conditions.
    Pour chaque tenue, fournis un nom, une description et la liste des IDs (string) des articles utilisés.
    Chaque tenue doit avoir au moins un haut, un bas et des chaussures.
    Ne propose que des tenues dont tous les articles sont dans la garde-robe.
    Retourne un tableau JSON respectant le schéma fourni.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: outfitSchema,
    }
  });

  return JSON.parse(response.text);
};


export const generateOutfitImage = async (itemsInOutfit: ClothingItem[]): Promise<string> => {
  const imagePrompt = `
    Crée une image photoréaliste d'une tenue de mode sur un mannequin ou en "flat lay" (posée à plat).
    La tenue est composée de : ${itemsInOutfit.map(i => `${i.name} (${i.color})`).join(', ')}.
    Le style doit être moderne, chic et épuré, digne d'un magazine de mode.
    L'arrière-plan doit être neutre et esthétique, dans des tons de gris ou beige.
    Ne montre pas de visage humain reconnaissable. La composition doit être visuellement agréable et luxueuse.
  `;

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: imagePrompt }] },
    config: {
      responseModalities: ['IMAGE'],
    },
  });
  
  if (imageResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
    const base64ImageBytes: string = imageResponse.candidates[0].content.parts[0].inlineData.data;
    return `data:image/png;base64,${base64ImageBytes}`;
  }

  throw new Error("La génération d'image a échoué.");
};

export const analyzeWardrobeGaps = async (wardrobe: ClothingItem[]): Promise<WardrobeAnalysis> => {
    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            suggestion: {
                type: Type.STRING,
                description: "Une suggestion très courte et directe pour UN ou DEUX articles clés manquants (ex: 'un blazer noir et des bottines en cuir')."
            },
            reasoning: {
                type: Type.STRING,
                description: "Une phrase expliquant pourquoi ces articles amélioreraient la garde-robe (ex: 'Ces pièces polyvalentes permettraient de créer des tenues plus formelles et d'ajouter une touche chic à vos looks décontractés.')."
            }
        },
        required: ['suggestion', 'reasoning']
    };

    const wardrobeForPrompt = wardrobe.map(({ image, userId, ...rest }) => rest);

    const prompt = `
        En tant qu'expert styliste, analyse la garde-robe suivante :
        ${JSON.stringify(wardrobeForPrompt)}

        Identifie le type d'article le plus crucial manquant qui augmenterait le plus la polyvalence de cette garde-robe.
        Fournis une suggestion concise pour 1 ou 2 articles, et une brève justification.
        Concentre-toi sur des pièces de base polyvalentes.
        Retourne la réponse au format JSON en respectant le schéma fourni.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        }
    });

    return JSON.parse(response.text);
};
