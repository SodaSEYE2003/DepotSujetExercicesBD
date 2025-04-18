import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {prisma} from "@/lib/prisma";
import bcryptjs from "bcryptjs";

// Fonction pour vérifier ou créer un utilisateur Google
async function getOrCreateGoogleUser(profile) {
  console.log("[AUTH] Google user login attempt:", profile.email);
  try {
    // Rechercher l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email: profile.email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Si l'utilisateur existe déjà
    if (user) {
      console.log("[AUTH] Google user found:", user.email, "with role:", user.roles[0]?.role.nom || 'unknown');
      return {
        id: user.id,
        email: user.email,
        name: `${user.prenom} ${user.nom}`,
        role: user.roles[0]?.role.nom || 'etudiant',
      };
    }

    // L'utilisateur n'existe pas, le créer
    console.log("[AUTH] Creating new Google user:", profile.email);
    const nameParts = profile.name.split(' ');
    const prenom = nameParts[0] || '';
    const nom = nameParts.slice(1).join(' ') || '';

    // Obtenir l'ID du rôle étudiant
    const etudiantRole = await prisma.role.findUnique({
      where: { nom: 'etudiant' }
    });

    if (!etudiantRole) {
      console.error("[AUTH] Student role not found in database");
      throw new Error('Rôle étudiant non trouvé');
    }

    // Générer un mot de passe aléatoire pour les comptes Google
    const randomPassword = Math.random().toString(36).slice(-10);
      
    // Créer l'utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        email: profile.email,
        password: randomPassword,
        nom: nom,
        prenom: prenom,
        actif: true,
        roles: {
          create: {
            role: {
              connect: {
                id: etudiantRole.id
              }
            }
          }
        }
      }
    });

    console.log("[AUTH] New Google user created:", newUser.email, "with role: etudiant");

    return {
      id: newUser.id,
      email: profile.email,
      name: `${prenom} ${nom}`,
      role: 'etudiant',
    };
  } catch (error) {
    console.error('[AUTH] Error creating/retrieving Google user:', error);
    throw error;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        console.log("[AUTH] Google profile received:", profile.email);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        };
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[AUTH] Credentials login attempt:", credentials?.email);
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing email or password");
            throw new Error("Email et mot de passe requis");
          }

          const user = await prisma.utilisateur.findUnique({
            where: { 
              email: credentials.email,
              actif: true
            },
            include: {
              roles: {
                include: {
                  role: true
                }
              }
            }
          });

          if (!user) {
            console.error("[AUTH] User not found:", credentials.email);
            throw new Error("Aucun utilisateur trouvé avec cet email");
          }

          console.log("[AUTH] User found:", user.email, "with role:", user.roles[0]?.role.nom || 'unknown');
          
          // Utiliser bcryptjs.compare pour vérifier le mot de passe
          const passwordMatch = await bcryptjs.compare(credentials.password, user.password);
          console.log("[AUTH] Password match:", passwordMatch);
          
          if (!passwordMatch) {
            console.error("[AUTH] Incorrect password for user:", credentials.email);
            throw new Error("Mot de passe incorrect");
          }

          const userData = {
            id: user.id,
            email: user.email,
            name: `${user.prenom} ${user.nom}`,
            role: user.roles[0]?.role.nom || 'etudiant',
          };
          
          console.log("[AUTH] Successful login, returning user data:", userData);
          return userData;
        } catch (error) {
          console.error("[AUTH] Authentication error:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[AUTH] Sign in callback started");
      console.log("[AUTH] User:", user?.email);
      console.log("[AUTH] Account provider:", account?.provider);
      
      // Pour l'authentification Google
      if (account?.provider === 'google' && profile) {
        try {
          // Obtenir ou créer l'utilisateur dans notre BD
          const googleUser = await getOrCreateGoogleUser(profile);
          
          // Mettre à jour l'objet user avec les infos de notre BD
          if (user) {
            user.id = googleUser.id;
            user.role = googleUser.role;
            console.log("[AUTH] Updated Google user with role:", googleUser.role);
          }
          
          return true;
        } catch (error) {
          console.error('[AUTH] Error during Google sign in:', error);
          return false;
        }
      }
      
      console.log("[AUTH] Sign in callback completed successfully");
      return true;
    },
    async session({ session, token }) {
      console.log("[AUTH] Session callback started");
      
      if (session?.user) {
        console.log("[AUTH] Updating session with token data");
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        
        console.log("[AUTH] Updated session with role:", token.role);
      }
      
      return session;
    },
    // Update your jwt callback to ensure all fields are set correctly
async jwt({ token, user, account }) {
  console.log("[AUTH] JWT callback started");
  
  // If it's a new login
  if (user) {
    console.log("[AUTH] JWT updating token with user data:", user.email);
    // Ensure the ID is a string (NextAuth expects string IDs)
    token.id = String(user.id);
    token.role = user.role;
    token.email = user.email;
    token.name = user.name;
    console.log("[AUTH] Updated token with role:", user.role);
  }

  // For Google login
  if (account?.provider === 'google') {
    token.provider = 'google';
    console.log("[AUTH] Token marked as Google provider");
  }
  
  console.log("[AUTH] JWT callback completed, token:", {
    id: token.id,
    email: token.email,
    role: token.role
  });
  return token;
},
async redirect({ url, baseUrl }) {
  console.log("[AUTH] Redirect callback started");
  console.log("[AUTH] Redirect URL:", url);
  console.log("[AUTH] Base URL:", baseUrl);
  
  try {
    // Handle login page redirects
    if (url.startsWith(`${baseUrl}/auth/login`) || url === `${baseUrl}/auth/login`) {
      if (url.includes('?callbackUrl=')) {
        // Extract the callback URL if it exists
        const callbackParam = new URL(url).searchParams.get('callbackUrl');
        if (callbackParam && !callbackParam.includes('/auth/login')) {
          console.log("[AUTH] Redirecting to callback URL from login:", callbackParam);
          return callbackParam.startsWith('/') ? `${baseUrl}${callbackParam}` : callbackParam;
        }
      }
      
      // If no valid callbackUrl, go to default dashboard
      console.log("[AUTH] Redirecting to dashboard (no valid callback)");
      return `${baseUrl}/etudiant`;
    }
    
    // If URL starts with base URL or is a relative path, use it
    if (url.startsWith(baseUrl) || url.startsWith('/')) {
      console.log("[AUTH] Using provided URL:", url);
      return url;
    }
  } catch (error) {
    console.error("[AUTH] URL parsing error:", error);
    // Fallback to a safe URL
    return `${baseUrl}/etudiant`;
  }
  
  // Default fallback
  console.log("[AUTH] Fallback to base URL:", baseUrl);
  return baseUrl;
}
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error(`[AUTH-ERROR] ${code}:`, metadata);
    },
    warn(code) {
      console.warn(`[AUTH-WARN] ${code}`);
    },
    debug(code, metadata) {
      console.log(`[AUTH-DEBUG] ${code}:`, metadata);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };