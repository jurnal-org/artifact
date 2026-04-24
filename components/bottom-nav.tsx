"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/history", label: "Storico", icon: Clock },
  { href: "/dashboard", label: "Trend", icon: BarChart3 },
];

const logo = (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/favicon.ico" alt="Jurnal" className="mb-5 h-8 w-8 rounded-[10px] object-cover shadow-[0_4px_12px_rgba(120,80,220,0.28)]" />
);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: floating sidebar */}
      <nav className="hidden md:flex fixed left-4 top-4 bottom-4 w-14 z-50 flex-col items-center py-4 gap-1.5 rounded-[18px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-[48px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.09),0_0_0_0.5px_rgba(255,255,255,0.04)]">
        {logo}
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-10 w-10 items-center justify-center rounded-[11px] transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-teal/[0.18] to-violet/[0.10] border border-teal/[0.22] shadow-[0_2px_10px_rgba(60,180,160,0.10)] text-teal"
                  : "text-white/[0.30] hover:text-white/50 hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </Link>
          );
        })}
      </nav>

      {/* Mobile: floating bottom pill */}
      <nav className="md:hidden fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-0.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-1.5 py-1.5 backdrop-blur-[48px] shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_0.5px_rgba(255,255,255,0.05)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 rounded-full px-3.5 py-1.5 text-[10px] transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-teal/[0.18] to-violet/[0.10] border border-teal/[0.22] text-teal shadow-[0_2px_8px_rgba(60,180,160,0.10)]"
                  : "text-white/[0.32] hover:text-white/50"
              }`}
            >
              <tab.icon className="h-[13px] w-[13px]" strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
