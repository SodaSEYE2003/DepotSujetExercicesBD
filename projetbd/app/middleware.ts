// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // page de connexion
  },
});

export const config = {
  matcher: ['/dashboard', '/protected/*'], // définir les pages protégées
};
