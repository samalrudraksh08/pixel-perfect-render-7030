import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Plane, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">Wayfare</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Compare flights and trains side by side, and book the whole journey in one place.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Book</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/search" search={{ mode: "flight" } as never} className="hover:text-primary">
                Flight tickets
              </Link>
            </li>
            <li>
              <Link to="/search" search={{ mode: "train" } as never} className="hover:text-primary">
                Train tickets
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-primary">
                My bookings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/help" className="hover:text-primary">
                Help centre
              </Link>
            </li>
            <li>About us</li>
            <li>Careers</li>
            <li>Partner with us</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Follow us</h4>
          <div className="flex gap-3 text-muted-foreground">
            <Instagram className="size-5 hover:text-primary" />
            <Twitter className="size-5 hover:text-primary" />
            <Facebook className="size-5 hover:text-primary" />
            <Youtube className="size-5 hover:text-primary" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Wayfare Travel Pvt. Ltd.
            <br />
            Bengaluru, India
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Wayfare. Demo experience with sample data.
      </div>
    </footer>
  );
}
