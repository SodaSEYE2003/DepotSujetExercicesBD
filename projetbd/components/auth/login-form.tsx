"use client";

import { CardWrapper } from "./card-wrapper";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { signIn } from "next-auth/react";
import { LoginSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { login } from "@/app/actions/login";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    
    startTransition(async () => {
      try {
        // Obtenir d'abord le rôle de votre fonction serveur
        const result = await login(values);
        
        if (result?.error) {
          setError(result.error);
          return;
        }
        
        // Vérifier si le rôle existe
        const userRole = result.userRole;
        if (!userRole) {
          setError("Impossible de déterminer votre rôle");
          return;
        }
        
        console.log(`Rôle obtenu: ${userRole}`);
        
        // Établir la session avec NextAuth
        const response = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (response?.error) {
          setError(response.error);
          return;
        }
        
        setSuccess(`Connexion réussie en tant que ${userRole}! Redirection...`);
        
        // Redirection directe basée sur le rôle
        if (userRole === "professeur") {
          window.location.href = "/professeur";
        } else if (userRole === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/etudiant";
        }
        
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        setError("Une erreur s'est produite lors de la connexion.");
      }
    });
  };

  return (
    <CardWrapper
      headerLabel="Bienvenue sur SenAuto"
      backButtonLabel="Pas encore de compte?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                {success}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="momo@gmail.com"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="*******"
                      type="password"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending}
          >
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};