// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { pool } from "@/lib/db";
import { compare } from "bcryptjs";
import { type DefaultSession } from "next-auth";
import type { Account, Profile } from "next-auth";


declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: string;
      matricule?: string;
      numEtudiant?: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
    matricule?: string;  
    numEtudiant?: string;
  }
  
}
declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
interface Credentials {
  email: string;
  password: string;
}
// Configuration MySQL (inchangée)


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials?:Credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const [rows]: any = await pool.query(
            "SELECT * FROM comptes WHERE email = ?", 
            [credentials?.email]
          );
          
          const user = rows[0];
          if (!user) return null;

          if (credentials.password !== user.password) {
            console.log("Mot de passe incorrect");
            return null;
          }
          // const isValid = await compare(credentials.password, user.password);
          // if (!isValid) return null;
          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role, 
            ...(user.matricule && { matricule: user.matricule }),
            ...(user.numEtudiant && { numEtudiant: user.numEtudiant
            })};
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Mise à jour quotidienne
  },
 
  // Dans authOptions
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production' 
    ? '__Secure-next-auth.session-token' 
    : 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "development" ? "localhost" : undefined,
      maxAge: 30 * 24 * 60 * 60 // 30 jours
    },
  },
},
jwt: {
  secret: process.env.NEXTAUTH_SECRET,
},
  callbacks: {
    async signIn({ user, account, profile }){ 
      if (account?.provider === "google") {
        try {
          const [existingUser]: any = await pool.query(
            "SELECT * FROM comptes WHERE email = ? OR googleId = ?", 
            [profile?.email, account.providerAccountId]
          );

          return existingUser.length > 0;
        } catch (error) {
          console.error("Erreur Google:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          role: user.role,
          matricule: user.matricule,
          numEtudiant: user.numEtudiant
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          role: token.role,
          matricule: token.matricule,
          numEtudiant: token.numEtudiant
        },
        expires: session.expires
      };
    }
  },
 
 
};
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
console.log("Secret loaded:", !!process.env.NEXTAUTH_SECRET);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };