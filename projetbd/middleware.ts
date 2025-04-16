import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Obtenir le token depuis la session NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Debug - afficher le token pour vérifier sa structure
  console.log("Token dans middleware:", pathname, token?.accessToken ? "Token présent" : "Pas de token");

  // Routes qui ne nécessitent pas d'authentification
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.') || 
      pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Si c'est une requête API (mais pas d'auth) et qu'on a un token d'accès
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && token?.accessToken) {
    // Cloner les headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('Authorization', `Bearer ${token.accessToken}`);
    
    // Debug
    console.log("Ajout du header Authorization pour:", pathname);
    
    // Retourner la requête avec les headers modifiés
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Configurer les routes où le middleware sera appliqué
export const config = {
  matcher: [
    // Toutes les routes sauf les ressources statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};