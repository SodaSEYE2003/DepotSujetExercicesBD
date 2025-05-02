"use client";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react"

export const Social = () =>{
  return (
    <div className="w-full flex items-center gap-x-2">
      <Button
      size="lg"
      className="w-full"
      variant= "outline"
      onClick={() =>signIn("google")}>
        <FcGoogle className="h-5 w-5"/>
      </Button>
    </div>
  )
}