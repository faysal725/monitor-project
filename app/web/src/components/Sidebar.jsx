"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Webhook, Activity, Menu, X } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile/tablet top bar with hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-100">API Monitor</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Backdrop for mobile/tablet drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: fixed rail on desktop, off-canvas drawer below lg */}
      <aside
        className={`
          w-56 shrink-0 border-r border-slate-800 bg-slate-950 min-h-screen p-4 flex flex-col
          fixed top-0 left-0 z-50 transition-transform duration-200
          lg:sticky lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-100">API Monitor</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}