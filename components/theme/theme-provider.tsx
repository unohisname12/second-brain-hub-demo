"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = pathname.startsWith("/supapara") ? "supapara" : "rust";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
