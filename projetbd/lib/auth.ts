import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import * as jwt from 'jsonwebtoken';

/**
 * Gets the current session from NextAuth
 */
export async function getSession() {
  try {
    // Try to get the session using the standard method first
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      console.log("[getSession] Session found via getServerSession for user:", session.user.email);
      return session;
    }
    
    // If we can't get a session using getServerSession, try to manually decode the token
    console.log("[getSession] No valid session from getServerSession, trying JWT token directly");
    
    // Access cookies in a server context
    const cookieStore = cookies();
    
    // Try to get the session token
    const tokenCookie = 
      cookieStore.get("next-auth.session-token") || 
      cookieStore.get("__Secure-next-auth.session-token");
    
    if (!tokenCookie?.value) {
      console.log("[getSession] No session token found in cookies");
      return null;
    }
    
    // Get the NextAuth secret
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[getSession] NEXTAUTH_SECRET environment variable is not set");
      return null;
    }
    
    try {
      // Verify and decode the JWT token
      const decodedToken = jwt.verify(tokenCookie.value, secret) as any;
      
      // Create a session object from the decoded token
      const manualSession = {
        user: {
          id: String(decodedToken.id),
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role,
        },
        expires: new Date(decodedToken.exp * 1000).toISOString()
      };
      
      console.log("[getSession] Successfully created session from JWT for user:", manualSession.user.email);
      return manualSession;
    } catch (decodeError) {
      console.error("[getSession] Error decoding token:", decodeError);
      return null;
    }
  } catch (error) {
    console.error("[getSession] Error retrieving session:", error);
    return null;
  }
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser() {
  try {
    // Get the session
    const session = await getSession();
    
    // Check if we have a session with a user
    if (!session?.user) {
      console.log("[getCurrentUser] No valid session found");
      return null;
    }
    
    // Log the user details we found
    console.log("[getCurrentUser] User found from session:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    });
    
    // Return the user details
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    };
  } catch (error) {
    console.error("[getCurrentUser] Error getting current user:", error);
    return null;
  }
}