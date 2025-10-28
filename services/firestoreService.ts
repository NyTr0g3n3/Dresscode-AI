import { 
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    deleteDoc,
    writeBatch,
    serverTimestamp,
} from "firebase/firestore";
import { 
    ref,
    uploadString,
    getDownloadURL,
    deleteObject
} from "firebase/storage";
import { db, storage } from "./firebase";
import type { ClothingItem, Outfit } from "../types";

const CLOTHES_COLLECTION = 'clothes';
const OUTFITS_COLLECTION = 'outfits';

// --- Clothing Items ---

export const getWardrobe = async (userId: string): Promise<ClothingItem[]> => {
    const q = query(collection(db, CLOTHES_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClothingItem));
};

export const addClothingItem = async (
    userId: string, 
    itemData: Omit<ClothingItem, 'id' | 'image' | 'userId'>, 
    imageBase64: string
): Promise<ClothingItem> => {
    // 1. Upload image to Firebase Storage
    const imageRef = ref(storage, `clothes/${userId}/${Date.now()}-${itemData.name.replace(/\s+/g, '-')}`);
    await uploadString(imageRef, imageBase64, 'data_url');
    const imageUrl = await getDownloadURL(imageRef);

    // 2. Add clothing item to Firestore
    const docData = {
        ...itemData,
        userId,
        image: imageUrl,
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, CLOTHES_COLLECTION), docData);

    return {
        id: docRef.id,
        ...docData
    } as ClothingItem;
};

export const deleteClothingItem = async (docId: string, imageUrl: string): Promise<void> => {
    // 1. Delete image from Storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef).catch(error => {
        // Log error but don't block deletion if file doesn't exist
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting image from Storage:", error);
            throw error;
        }
    });

    // 2. Delete document from Firestore
    await deleteDoc(doc(db, CLOTHES_COLLECTION, docId));
};

export const updateItemsSetId = async (itemIds: string[], setId: string | null): Promise<void> => {
    const batch = writeBatch(db);
    itemIds.forEach(id => {
        const docRef = doc(db, CLOTHES_COLLECTION, id);
        batch.update(docRef, { setId });
    });
    await batch.commit();
};


// --- Saved Outfits ---

export const getSavedOutfits = async (userId: string): Promise<Outfit[]> => {
    const q = query(collection(db, OUTFITS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    // Note: 'items' in Firestore might just be IDs. Here we assume they are stored fully.
    // For better performance, one could store item IDs and fetch details separately.
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Outfit));
};

export const saveOutfit = async (userId: string, outfit: Omit<Outfit, 'id'>): Promise<Outfit> => {
     // Prepare data for Firestore: Convert full ClothingItem objects to references or just IDs
    const itemsAsIds = outfit.items.map(item => item.id);

    const docData = {
        userId,
        name: outfit.name,
        description: outfit.description,
        itemIds: itemsAsIds,
        // The generated image is base64, so we might want to upload it to storage as well
        // For now, let's just store it as is, or maybe not store it for saved outfits
        // to save space. Let's decide not to store the generated image.
        // We will store the URLs of the actual items.
        itemImages: outfit.items.map(item => item.image),
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, OUTFITS_COLLECTION), { ...docData });
    
    return {
        ...outfit,
        id: docRef.id,
    };
};

export const unsaveOutfit = async (outfitId: string): Promise<void> => {
    await deleteDoc(doc(db, OUTFITS_COLLECTION, outfitId));
};