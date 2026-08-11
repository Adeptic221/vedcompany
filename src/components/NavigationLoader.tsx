"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSphere } from "./LoadingSphere";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    startTransition(() => {
      setVisible(false);
    });
  }, [pathname, searchParams, mounted]);

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

  // Never SSR a blocking overlay — only after client mount.
  if (!mounted || !visible) return null;

  return <LoadingSphere fullscreen />;
}
