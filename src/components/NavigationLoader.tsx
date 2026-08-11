"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSphere } from "./LoadingSphere";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);
  const [, startTransition] = useTransition();

  // Brief splash on first paint so the brand preloader is visible.
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setVisible(false);
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (href === pathname) return;
      setVisible(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (!visible) return null;

  return <LoadingSphere fullscreen />;
}
