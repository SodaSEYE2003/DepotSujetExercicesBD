'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ redirected: false, timestamp: '', role: '' });
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Récupérer callbackUrl des paramètres d'URL
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

 // Rediriger si déjà authentifié (only when the page loads)
useEffect(() => {
  if (status === 'authenticated' && session?.user?.role) {
    console.log("[LOGIN] Already authenticated user detected, preparing to redirect");
    console.log("[LOGIN] User role:", session.user.role);
    
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    setDebugInfo({
      redirected: true,
      timestamp: timestamp,
      role: session.user.role
    });
    
    // Only redirect if not already on a role-specific page
    const currentPath = window.location.pathname;
    const isOnRolePage = 
      (session.user.role === 'etudiant' && currentPath.startsWith('/etudiant')) ||
      (session.user.role === 'professeur' && currentPath.startsWith('/professeur')) ||
      (session.user.role === 'admin' && currentPath.startsWith('/admin'));
    
    if (!isOnRolePage) {
      let redirectPath = '/';
      
      switch (session.user.role) {
        case 'etudiant':
          redirectPath = '/etudiant';
          break;
        case 'professeur':
          redirectPath = '/professeur';
          break;
        case 'admin':
          redirectPath = '/admin';
          break;
      }
      
      console.log("[LOGIN] Redirecting already authenticated user to:", redirectPath);
      window.location.href = redirectPath;
    }
  }
}, []); // Only run once on mount
  // Fonction de redirection basée sur le rôle
  const redirectBasedOnRole = (role) => {
    console.log("[LOGIN] Redirecting based on role:", role);
    
    if (callbackUrl && callbackUrl !== '/auth/login') {
      console.log("[LOGIN] Redirecting to callback URL:", callbackUrl);
      router.push(callbackUrl);
    } else {
      // Sinon, rediriger en fonction du rôle
      let redirectPath = '/';
      
      switch (role) {
        case 'etudiant':
          redirectPath = '/etudiant';
          break;
        case 'professeur':
          redirectPath = '/professeur';
          break;
        case 'admin':
          redirectPath = '/admin';
          break;
        default:
          redirectPath = '/';
          break;
      }
      
      console.log("[LOGIN] Redirecting to role-based path:", redirectPath);
      toast.success(`Redirection vers ${redirectPath}`);
      router.push(redirectPath);
    }
  };

 // Modify your handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    console.log("[LOGIN] Submitting credentials with email:", email);
    
    // Calculate the correct callback URL based on role or provided URL
    let effectiveCallbackUrl = '/etudiant'; // Default to student dashboard
    
    // If there's a valid callback URL from params, use it
    if (callbackUrl && !callbackUrl.includes('/auth/login')) {
      effectiveCallbackUrl = callbackUrl;
    }
    
    console.log("[LOGIN] Using callback URL:", effectiveCallbackUrl);
    
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: effectiveCallbackUrl, // Set explicit callback URL here
    });

    if (result?.error) {
      console.error("[LOGIN] Sign-in error:", result.error);
      setError(result.error);
      toast.error("Échec de la connexion");
    } else {
      toast.success("Connexion réussie");
      
      // Wait for session to be updated and then redirect
      setTimeout(async () => {
        try {
          const updatedSession = await getSession();
          console.log("[LOGIN] Updated session after login:", updatedSession);
          
          // Determine redirect URL based on role
          let redirectUrl = '/etudiant'; // Default
          
          if (updatedSession?.user?.role) {
            switch (updatedSession.user.role) {
              case 'etudiant':
                redirectUrl = '/etudiant';
                break;
              case 'professeur':
                redirectUrl = '/professeur';
                break;
              case 'admin':
                redirectUrl = '/admin';
                break;
            }
          }
          
          console.log("[LOGIN] Explicitly redirecting to:", redirectUrl);
          
          // Force redirect with replace to avoid history issues
          window.location.href = redirectUrl;
        } catch (error) {
          console.error("[LOGIN] Session or redirect error:", error);
          // Fallback to safe redirect
          window.location.href = '/etudiant';
        }
      }, 1000);
    }
  } catch (err) {
    console.error("[LOGIN] Error during sign-in:", err);
    setError("Une erreur s'est produite lors de la connexion");
    toast.error("Erreur de connexion");
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-indigo-200 mt-2">Accédez à votre compte</p>
        </div>
        
        <div className="p-6">
          {/* Informations de débogage */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <p><strong>Session Status:</strong> {status}</p>
              <p><strong>User Email:</strong> {session?.user?.email || 'None'}</p>
              <p><strong>User Role:</strong> {session?.user?.role || 'None'}</p>
              {debugInfo.redirected && (
                <p className="text-green-600">
                  Redirected at {debugInfo.timestamp} with role: {debugInfo.role}
                </p>
              )}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <div className="text-red-500 font-medium">
                  {error}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continuez avec
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  console.log("[LOGIN] Google sign-in initiated");
                  signIn('google', { callbackUrl });
                }}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.786-1.667-4.156-2.685-6.735-2.685-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.496 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z"/>
                </svg>
                Google
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  S'inscrire
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}