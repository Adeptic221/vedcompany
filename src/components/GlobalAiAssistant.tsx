"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AiAssistantWidget } from "@/components/cabinet/AiAssistantWidget";
import type { Car } from "@/types/car";

export function GlobalAiAssistant() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cars")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setCars(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const onAdmin = pathname.startsWith("/admin");
  const onAfterSales =
    pathname.startsWith("/cabinet") && searchParams.get("tab") === "aftersales";

  if (onAdmin || onAfterSales) return null;

  return <AiAssistantWidget cars={cars} />;
}