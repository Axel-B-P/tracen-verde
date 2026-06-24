import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Beef, Syringe, BellRing, QrCode } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/animales", label: "Animales", icon: Beef, exact: false },
  { to: "/sanitarios", label: "Registros sanitarios", icon: Syringe, exact: false },
  { to: "/alertas", label: "Alertas", icon: BellRing, exact: false },
  { to: "/qr", label: "Generar QR", icon: QrCode, exact: false },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 px-5 py-6 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Beef className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">TrazaGan</div>
            <div className="text-[11px] opacity-70">Trazabilidad ganadera</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
            JP
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">Juan Pérez</div>
            <div className="text-[11px] opacity-70">Admin</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
