import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Obtenir le token depuis la session NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/api/auth',
    '/_next',
    '/favicon.ico'
  ];
  
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === '/'
  );

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Redirection basée sur le rôle
  if (token) {
    // Si déjà connecté et tente d'accéder aux pages d'auth
    if (pathname === '/auth/login' || pathname === '/auth/register') {
      switch (token.role) {
        case 'etudiant':
          return NextResponse.redirect(new URL('/etudiant', req.url));
        case 'professeur':
          return NextResponse.redirect(new URL('/professeur', req.url));
        case 'admin':
          return NextResponse.redirect(new URL('/admin', req.url));
        default:
          return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    // Restrictions d'accès basées sur le rôle
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${token.role}`, req.url));
    }
    
    if (pathname.startsWith('/professeur') && token.role !== 'professeur' && token.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${token.role}`, req.url));
    }
    
    // Ajouter le token JWT pour les appels API
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && token?.accessToken) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('Authorization', `Bearer ${token.accessToken}`);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

// Configurer les routes où le middleware sera appliqué
export const config = {
  matcher: [
    // Toutes les routes sauf les ressources statiques
    '/((?!_next/static|_next/image).*)',
  ],
};