import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Activez le mode debug pour plus d'informations
const debug = true;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (debug) console.log("Tentative d'authentification avec:", credentials.email);
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });
          
          const text = await response.text();
          if (debug) console.log("Réponse API brute:", text);
          
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error("La réponse n'est pas un JSON valide:", text);
            throw new Error("Format de réponse invalide");
          }
          
          if (debug) console.log("Données d'authentification:", data);
          
          if (!response.ok) {
            console.error("Erreur d'authentification:", data);
            throw new Error(data.message || "Échec de l'authentification");
          }
          
          // ICI EST LE CHANGEMENT IMPORTANT - MODIFICATION DE LA VÉRIFICATION
          // Les données utilisateur sont déjà au niveau racine, pas besoin de data.user
          // Retourner directement l'objet data qui contient déjà toutes les infos nécessaires
          return data;
          
        } catch (error) {
          console.error("Erreur complète:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = `${user.prenom} ${user.nom}`;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.accessToken = token.accessToken;
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  debug: debug,
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };