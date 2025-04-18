import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  try {
    const { pathname} = request.nextUrl;
    console.log(`[MIDDLEWARE]  ${pathname}`);
    
    // Check if it's a static resource
    if (
      pathname.startsWith('/_next') || 
      pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/)
    ) {
      return NextResponse.next();
    }
    
    // Allow public API routes
    if (pathname.startsWith('/api/auth')) {
      console.log("[MIDDLEWARE] Auth API route, allowing");
      return NextResponse.next();
    }
    
    
    // Public routes anyone can access
    const publicRoutes = [
      '/auth/login', 
      '/auth/register', 
      '/auth/error',
      '/auth/reset-password', 
      '/auth/forgot-password'
    ];
    
    if (publicRoutes.includes(pathname)) {
      console.log("[MIDDLEWARE] Public route, allowing");
      return NextResponse.next();
    }
    
    // Get the token to check authentication
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const isLoggedIn = !!token;
    console.log("[MIDDLEWARE] User is logged in:", isLoggedIn, "Path:", pathname);
    
    // If user is not logged in and trying to access a protected route
    if (!isLoggedIn) {
      console.log("[MIDDLEWARE] Not authenticated, redirecting to login");
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // Role-based route protection
    if (token?.role) {
      // Define role-specific paths
      const professorPaths = ['/professeur'];
      const studentPaths = ['/etudiant'];
      const adminPaths = ['/admin'];
      
      // Check if the user is trying to access a path that doesn't match their role
      if (
        (token.role !== 'professeur' && professorPaths.some(path => pathname.startsWith(path))) ||
        (token.role !== 'etudiant' && studentPaths.some(path => pathname.startsWith(path))) ||
        (token.role !== 'admin' && adminPaths.some(path => pathname.startsWith(path)))
      ) {
        console.log("[MIDDLEWARE] User role", token.role, "doesn't match path", pathname);
        
        // Redirect to appropriate path based on role
        let redirectPath = '/';
        switch (token.role) {
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
        
        console.log("[MIDDLEWARE] Redirecting to role-appropriate path:", redirectPath);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
    
    // If nothing else matched, allow the request
    return NextResponse.next();
  } catch (error) {
    console.error("[MIDDLEWARE] Error:", error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}