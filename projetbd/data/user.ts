import { prisma } from "@/lib/prisma";

export const getUserByEmail = async (email: string) =>{
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where:{
        email,
      }
    })
    return utilisateur;
  } catch (error) {
    return null
  }
}

export const getUserById = async (id: string) =>{
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where:{
        id,
      }
    })
    return utilisateur;
  } catch (error) {
    return null
  }
}