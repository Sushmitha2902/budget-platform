import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/years", label: "Years" },
  { href: "/search", label: "Search" },
  { href: "/anomalies", label: "Anomalies" },
  { href: "/compare", label: "Compare" },
  { href: "/pipeline", label: "Pipeline" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Tricolor strip */}
      <div className="h-[5px] w-full shrink-0 bg-gradient-to-r from-[#FF9933] via-white via-50% to-[#138808]" />

      {/* Navbar */}
      <header className="bg-[#1B2B4B] text-white shrink-0 shadow-md z-50 sticky top-0">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
          style={{ height: "60px" }}
        >
          {/* Brand */}
          <Link href="/" className="flex flex-col group shrink-0 mr-6">
            <span className="font-serif text-lg leading-tight group-hover:text-[#FF9933] transition-colors">
              🇮🇳 Budget Analysis Platform
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Union Budget · 2013–14 to 2026–27
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} active={isActive(href)}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Indian Union Budget Analysis Platform · Data 2013–14 to 2026–27</span>
          <span className="font-mono">130,500 rows · 10 sectors · 14 years</span>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? "bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30"
          : "text-slate-300 hover:bg-white/8 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
