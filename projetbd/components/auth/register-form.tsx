"use client";

import { CardWrapper } from "./card-wrapper"
import * as z from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem, 
  FormLabel,
  FormMessage
 } from "../ui/form";

import { RegisterSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSucces } from "../form-success";
import { register } from "@/actions/register";

export const RegisterForm = () =>{
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues:{
      email: "",
      password: "",
      name: "",
    },
  });
  const onSubmit = (values: z.infer<typeof RegisterSchema>) =>{
      setError("");
      setSuccess("");
      startTransition(() =>{
        register(values)
        .then((data) =>{
          setError(data.error);
          setSuccess(data.succes);
        });
      });
  }
  return(
    <CardWrapper
      headerLabel="Créer un compte"
      backButtonLabel="Tu as déja un compte?"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6">
          <div className="space-y-4">
            <FormField 
              control={form.control}
              name= "email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                    {...field}
                    placeholder="momo@gmail.com"
                    type="email"
                    disabled={isPending}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField 
              control={form.control}
              name= "name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input 
                    {...field}
                    placeholder="Mamadou"
                    type="name"
                    disabled={isPending}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField 
              control={form.control}
              name= "password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input 
                    {...field}
                    placeholder="*******"
                    type="password"
                    disabled={isPending}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error}/>
          <FormSucces message={success}/>
          <Button
          type="submit"
          className="w-full"
          disabled={isPending}>
            Créer un compte
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}