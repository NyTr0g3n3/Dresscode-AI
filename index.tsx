import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthPage from './components/AuthPage';
import { auth, isFirebaseConfigValid } from './services/firebase';
import type { FirebaseUser } from './types';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const FirebaseConfigError: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-900/20 p-4">
    <div className="max-w-2xl w-full bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-red-300 dark:border-red-700 text-center">
      <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Erreur de Configuration Firebase</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Il semble que l'application ne soit pas correctement connectée à votre projet Firebase.
      </p>
      <div className="mt-6 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Action requise :</p>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Veuillez ouvrir le fichier <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-amber-400 font-mono p-1 rounded">services/firebase.ts</code> et remplacer les valeurs de l'objet <code>firebaseConfig</code> par celles de votre propre projet Firebase.
        </p>
        <p className="mt-4 text-xs text-gray-500">
          Vous pouvez trouver ces informations dans les paramètres de votre projet sur la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">console Firebase</a>.
        </p>
      </div>
    </div>
  </div>
);

const AppWrapper: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  if (!isFirebaseConfigValid) {
    return <FirebaseConfigError />;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <App user={user} onSignOut={handleSignOut} />;
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);