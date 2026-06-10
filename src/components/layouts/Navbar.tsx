"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { 
  TrendingUp, 
  GitCompare, 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  User as UserIcon,
  Shield,
  MessageSquareText,
  Gift,
  Wrench,
  ChevronDown,
  Calculator,
  FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const links = [
    { href: "/salaries", label: "Salaries", icon: TrendingUp },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/reviews", label: "Reviews", icon: MessageSquareText },
    { href: "/benefits", label: "Benefits", icon: Gift },
    { href: "/submit", label: "Submit Salary", icon: PlusCircle },
  ];

  const toolLinks = [
    { href: "/tools/take-home-salary", label: "Take-Home Salary", icon: Calculator },
    { href: "/tools/offer-analysis", label: "Offer Analysis", icon: FileSearch },
  ];

  if (session) {
    links.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
    if (session.user?.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@paylens.io")) {
      links.push({ href: "/admin", label: "Admin", icon: Shield });
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bone/20 bg-charcoal backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-tr from-bronze to-desert p-2 rounded-lg text-white shadow-md shadow-bronze/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-bone to-bone/60 bg-clip-text text-transparent">
                PayLens
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-bronze/10 text-bronze border border-bronze/20"
                      : "text-bone/70 hover:text-bone hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="relative">
              <button
                onClick={() => { setToolsOpen(!toolsOpen); setProfileOpen(false); }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/tools")
                    ? "bg-bronze/10 text-bronze border border-bronze/20"
                    : "text-ash hover:text-foreground hover:bg-muted/50 border border-transparent"
                }`}
              >
                <Wrench className="h-4 w-4" />
                <span>Tools</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
              </button>
              {toolsOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-olive bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-1 backdrop-blur-md z-50">
                  {toolLinks.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon className="h-4 w-4 text-sage" />
                        <span>{tool.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Auth Button / Profile Dropdown */}
          <div className="hidden md:flex items-center">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setToolsOpen(false); }}
                  className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user?.name || "Avatar"}
                      className="h-8 w-8 rounded-full border border-bone/30"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-bone/30">
                      <UserIcon className="h-4 w-4 text-bone" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-bone max-w-[120px] truncate">
                    {session.user?.name || "User"}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-olive bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1 backdrop-blur-md">
                    <div className="px-3 py-2 border-b border-olive text-xs text-sage truncate">
                      {session.user?.email}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center space-x-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-muted transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => signIn()}
                size="sm"
                className="flex items-center space-x-1.5 bg-bone/10 text-bone border border-bone/30 hover:bg-bone/20"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-bone/70 hover:bg-white/10 hover:text-bone focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-desert/30 bg-charcoal px-2 pt-2 pb-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium ${
                  active
                    ? "bg-bronze/10 text-bronze border border-bronze/20"
                    : "text-bone/70 hover:text-bone hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 pb-1 px-3">
            <p className="text-[10px] font-bold text-bone/50 uppercase tracking-wider mb-1">Tools</p>
            {toolLinks.map((tool) => {
              const Icon = tool.icon;
              const active = isActive(tool.href);
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium ${
                    active
                      ? "bg-bronze/10 text-bronze border border-bronze/20"
                      : "text-bone/70 hover:text-bone hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tool.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-2 border-t border-bone/20 mt-4 px-3 flex flex-col space-y-3">
            {session ? (
              <>
                <div className="flex items-center space-x-3">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user?.name || "Avatar"}
                      className="h-10 w-10 rounded-full border border-bone/30"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-bone/30">
                      <UserIcon className="h-5 w-5 text-bone" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-bone">{session.user?.name}</div>
                    <div className="text-xs text-bone/60 truncate max-w-[200px]">{session.user?.email}</div>
                  </div>
                </div>
                <Button
                  onClick={() => signOut()}
                  size="sm"
                  className="w-full justify-center bg-bone/10 text-bone border border-bone/30 hover:bg-bone/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => signIn()}
                className="w-full justify-center bg-bone/10 text-bone border border-bone/30 hover:bg-bone/20"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
