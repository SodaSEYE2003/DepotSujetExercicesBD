import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Échec de l'authentification");
          }

          // Récupération de la réponse de l'API
          const userData = await response.json();
          
          // Passation des informations à NextAuth, notamment le rôle
          return {
            id: userData.id,
            email: userData.email,
            name: `${userData.prenom} ${userData.nom}`,
            role: userData.role,      // Important pour la gestion des rôles
            accessToken: userData.accessToken  // Pour les appels API authentifiés
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Transfert des informations utilisateur au token JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;      // Important: stocke le rôle dans le token
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfert des informations du token à la session accessible côté client
      session.user.id = token.id;
      session.user.role = token.role;  // Important: rend le rôle disponible dans la session
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
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };