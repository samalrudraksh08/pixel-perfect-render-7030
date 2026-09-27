import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgePercent,
  Headphones,
  ShieldCheck,
  Sparkles,
  Train,
  Wallet,
  Plane,
} from "lucide-react";
import { SearchWidget } from "@/components/site/search-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImg from "@/assets/hero.jpg";
import goaImg from "@/assets/dest-goa.jpg";
import jaipurImg from "@/assets/dest-jaipur.jpg";
import manaliImg from "@/assets/dest-manali.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wayfare — Compare and book flights & trains" },
      {
        name: "description",
        content:
          "Search flights and trains side by side, filter by price and timing, and book in minutes with Wayfare.",
      },
      { property: "og:title", content: "Wayfare — Compare and book flights & trains" },
      {
        property: "og:description",
        content: "Search flights and trains side by side and book your whole journey in one place.",
      },
    ],
  }),
  component: Home,
});

const destinations = [
  { name: "Goa", img: goaImg, tag: "Beaches", price: "₹3,320" },
  { name: "Jaipur", img: jaipurImg, tag: "Heritage", price: "₹2,180" },
  { name: "Manali", img: manaliImg, tag: "Mountains", price: "₹1,640" },
];

const deals = [
  {
    icon: BadgePercent,
    title: "Flat 12% off domestic flights",
    desc: "Use code WAYFLY on bookings above ₹4,000.",
    tag: "Flights",
  },
  {
    icon: Train,
    title: "₹150 cashback on AC trains",
    desc: "Valid on Rajdhani and Duronto bookings.",
    tag: "Trains",
  },
  {
    icon: Wallet,
    title: "Zero convenience fee",
    desc: "First booking on Wayfare, any route.",
    tag: "New users",
  },
];

const trust = [
  { icon: ShieldCheck, title: "Secure checkout", desc: "Bank-grade encryption on every payment." },
  { icon: Sparkles, title: "Honest pricing", desc: "Taxes and fees shown before you pay." },
  { icon: Headphones, title: "24×7 support", desc: "Real people, on call through your trip." },
  { icon: Plane, title: "One search, two modes", desc: "Flights and trains compared together." },
];

function Home() {
  return (
    <>
      <section className="relative">
        <img
          src={heroImg}
          alt="View of an aircraft wing over a turquoise coastline at sunset"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 sm:pt-28">
          <div className="max-w-2xl text-primary-foreground">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="size-3.5" /> Flights & trains, one search
            </Badge>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              Every journey, booked in one place.
            </h1>
            <p className="mt-4 max-w-xl text-base opacity-90 sm:text-lg">
              Compare airlines and rail operators side by side, filter on what matters, and hold
              your seat in under two minutes.
            </p>
          </div>
          <div className="mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead
          title="Popular destinations"
          sub="Where travellers are heading this season."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link
              key={d.name}
              to="/search"
              search={{ mode: "flight" } as never}
              className="group relative overflow-hidden rounded-2xl shadow-card"
            >
              <img
                src={d.img}
                alt={d.name}
                loading="lazy"
                width={800}
                height={1008}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="hero-overlay absolute inset-0 opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <Badge variant="secondary" className="mb-2">
                  {d.tag}
                </Badge>
                <h3 className="text-2xl font-semibold">{d.name}</h3>
                <p className="text-sm opacity-90">from {d.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead title="Deals & offers" sub="Limited-time savings across flights and rail." />
          <div className="grid gap-6 md:grid-cols-3">
            {deals.map((d) => (
              <div key={d.title} className="surface-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
                  <d.icon className="size-5" />
                </span>
                <Badge variant="outline" className="mt-4">
                  {d.tag}
                </Badge>
                <h3 className="mt-3 text-lg font-semibold">{d.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead title="Why book with us" sub="The boring bits, done properly." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="surface-card p-6 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <t.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="cta" size="xl">
            <Link to="/search" search={{ mode: "flight" } as never}>
              Start searching
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="mt-1 text-muted-foreground">{sub}</p>
    </div>
  );
}
