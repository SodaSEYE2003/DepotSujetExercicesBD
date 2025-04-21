"use server";

import { LoginSchema } from "@/schemas";
import * as z from "zod";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Champs invalides" };
  }

  const { email, password } = validatedFields.data;

  try {
    // Chercher l'utilisateur par son email dans la base de données
    const user = await prisma.utilisateur.findUnique({
      where: { email: email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return { error: "Utilisateur non trouvé" };
    }

    // Vérification du mot de passe
    const passwordsMatch = await bcryptjs.compare(password, user.password);

    if (!passwordsMatch) {
      return { error: "Mot de passe invalide" };
    }

    const userRole = user.roles[0]?.role?.nom;

    return { 
      success: "Connexion réussie", 
      userRole, 
      userId: user.id, 
      redirect: DEFAULT_LOGIN_REDIRECT 
    };
  } catch (error) {
    console.error("LOGIN ERROR", error);
    return { error: "Une erreur s'est produite!" };
  }
};