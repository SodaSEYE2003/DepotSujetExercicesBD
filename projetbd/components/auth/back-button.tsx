"use client";

import { Button } from "../ui/button";
import Link from "next/link"
interface BackButtonProps  {
  href: string;
  label: string;
}
export const BackButton = ({
  href, label
}:BackButtonProps) => {
  return (
    <Button variant="link" className="w-full font-normal" size="sm">
      <Link href= {href}>
        {label}
      </Link>
    </Button>
  )
}
