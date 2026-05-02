"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, GraduationCap, Radar } from "lucide-react";

const links = [
  { href: "/",         label: "Home",      icon: Home },
  { href: "/chat",     label: "Chat",      icon: MessageSquare },
  { href: "/supapara", label: "SupaPara",  icon: GraduationCap },
  { href: "/mission",  label: "Mission",   icon: Radar },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-14 border-r border-border bg-panel flex flex-col items-center py-3 gap-2">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`p-2 rounded-md transition-colors ${
              active ? "bg-accent text-bg" : "text-muted hover:text-fg hover:bg-bg/50"
            }`}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </nav>
  );
}
