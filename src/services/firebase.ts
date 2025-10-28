import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoMQ8oVPP5oFjw8YzgF0H1Dy4DAJmNaKM",
  authDomain: "dresscode-ai-32c50.firebaseapp.com",
  projectId: "dresscode-ai-32c50",
  storageBucket: "dresscode-ai-32c50.appspot.com",
  messagingSenderId: "215593114437",
  appId: "1:215593114437:web:5d9c1f3161182802f37c2c"
};

// Check if the config has been updated from the placeholder values
export const isFirebaseConfigValid = 
  firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXX" &&
  firebaseConfig.projectId !== "VOTRE-PROJECT-ID";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};
