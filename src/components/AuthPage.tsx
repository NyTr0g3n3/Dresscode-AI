import React, { useState } from 'react';
import { 
    signInWithGoogle, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    auth
} from '../services/firebase';
import { WardrobeIcon, GoogleIcon } from './icons';

type AuthMode = 'signIn' | 'signUp';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthError = (err: any) => {
        setIsLoading(false);
        console.error(err);
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                setError('Email ou mot de passe incorrect.');
                break;
            case 'auth/email-already-in-use':
                setError('Cette adresse email est déjà utilisée.');
                break;
            case 'auth/weak-password':
                setError('Le mot de passe doit contenir au moins 6 caractères.');
                break;
            case 'auth/invalid-email':
                setError('Adresse email invalide.');
                break;
            default:
                setError('Une erreur est survenue. Veuillez réessayer.');
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithGoogle();
            // The onAuthStateChanged listener in AppWrapper will handle the redirect
        } catch (err) {
            handleAuthError(err);
        }
    };

    const handleEmailAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (mode === 'signUp') {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            handleAuthError(err);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col justify-center items-center p-4">
             <div className="absolute top-8 flex items-center gap-3">
                <WardrobeIcon className="w-10 h-10 text-amber-500" />
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Dresscode <span className="text-amber-500">AI</span>
                </h1>
            </div>

            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                <div className="mb-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setMode('signIn')}
                            className={`w-1/2 py-3 text-sm font-semibold transition-colors ${mode === 'signIn' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            Se Connecter
                        </button>
                        <button
                            onClick={() => setMode('signUp')}
                            className={`w-1/2 py-3 text-sm font-semibold transition-colors ${mode === 'signUp' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            S'inscrire
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <GoogleIcon className="w-5 h-5"/>
                    <span>Continuer avec Google</span>
                </button>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                    <span className="mx-4 text-xs font-semibold text-gray-400 dark:text-gray-500">OU</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                    </div>

                     {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black dark:text-black bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900 disabled:bg-amber-300 disabled:cursor-not-allowed"
                    >
                         {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div> : (mode === 'signIn' ? 'Se Connecter' : 'Créer un compte')}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default AuthPage;
