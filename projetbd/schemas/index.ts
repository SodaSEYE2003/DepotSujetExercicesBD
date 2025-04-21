import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "email invalide"
  }),
  password: z.string().min(1,{message: "le mot de passe est requis"})
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "email invalide"
  }),
  password: z.string().min(6,
    {message: "le mot de passe doit contenir au minimum 6 caractéres"}),
    name: z.string().min(1,{
      message: "Le nom est requis"
    }),
    
});