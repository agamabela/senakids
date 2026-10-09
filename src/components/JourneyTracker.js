"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordActivity } from "@/lib/journey";

export default function JourneyTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordActivity(pathname);
  }, [pathname]);

  return null;
}
