import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Plane, Train, TicketCheck, LifeBuoy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthDialog } from "@/components/site/auth-dialog";
import { useBooking } from "@/lib/booking-store";

const links = [
  { to: "/search", label: "Flights", icon: Plane, search: { mode: "flight" } as const },
  { to: "/search", label: "Trains", icon: Train, search: { mode: "train" } as const },
  { to: "/bookings", label: "My Bookings", icon: TicketCheck, search: undefined },
  { to: "/help", label: "Help", icon: LifeBuoy, search: undefined },
];

export function Header() {
  const { user, signOut } = useBooking();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [menuOpen, setMenuOpen] = useState(false);

  function openAuth(tab: "login" | "signup") {
    setAuthTab(tab);
    setAuthOpen(true);
    setMenuOpen(false);
  }

  const nav = (onNavigate?: () => void) =>
    links.map((l) => (
      <Link
        key={l.label}
        to={l.to}
        search={l.search as never}
        onClick={onNavigate}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
      >
        <l.icon className="size-4" />
        {l.label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Plane className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Wayfare</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">{nav()}</nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserRound className="size-4" />
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>
                Login
              </Button>
              <Button variant="cta" size="sm" onClick={() => openAuth("signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-10 flex flex-col gap-5">
              {nav(() => setMenuOpen(false))}
              <div className="mt-4 flex flex-col gap-2">
                {user ? (
                  <Button variant="outline" onClick={signOut}>
                    Log out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => openAuth("login")}>
                      Login
                    </Button>
                    <Button variant="cta" onClick={() => openAuth("signup")}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialTab={authTab} />
    </header>
  );
}
