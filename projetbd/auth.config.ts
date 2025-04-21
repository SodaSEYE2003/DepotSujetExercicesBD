import Google from "next-auth/providers/google"
import type  NextAuthConfig  from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail } from "@/data/user";
import  bcrypt from "bcryptjs";
import { LoginSchema } from "@/schemas";
import { login } from "@/app/actions/login"; // Import the login function

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    Credentials(
      {
        async authorize(credentials){
          const validatedFields = LoginSchema.safeParse(credentials)
    
          if(validatedFields.success){
            const {email, password} = validatedFields.data;
    
            // Call the login function
            const loginResult = await login({email, password});

            if (loginResult?.error) return null;

            // Check if the login was successful and return the user object with the ID
            if (loginResult?.success && loginResult?.userId) {
              // Fetch the user from the database to get all user properties
              const user = await getUserByEmail(email);
              if(!user) return null;

              return {
                id: loginResult.userId,
                email: user.email,
                name: user.prenom,
                 // Or however you want to populate the user object
                // Add other user properties as needed
              };
            }
          }
    
          return null;
        }
      }
    )
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig