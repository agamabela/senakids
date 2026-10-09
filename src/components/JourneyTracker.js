"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordActivity } from "@/lib/journey";
import { autoRecordRoute } from "@/lib/activity-history";

export default function JourneyTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordActivity(pathname);
    autoRecordRoute(pathname);
  }, [pathname]);

  return null;
}
