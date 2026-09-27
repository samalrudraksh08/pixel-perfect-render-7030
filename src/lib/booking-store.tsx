import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SEED_BOOKINGS,
  type Booking,
  type BookingStatus,
  type TravelMode,
  type Trip,
} from "./travel-data";

export type SearchQuery = {
  mode: TravelMode;
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  roundTrip: boolean;
  passengers: number;
  travelClass: string;
};

export type PassengerDetails = {
  name: string;
  age: string;
  gender: string;
};

export type ContactDetails = { email: string; phone: string };

type BookingState = {
  query: SearchQuery;
  setQuery: (q: SearchQuery) => void;
  selectedTrip: Trip | null;
  setSelectedTrip: (t: Trip | null) => void;
  passengers: PassengerDetails[];
  setPassengers: (p: PassengerDetails[]) => void;
  contact: ContactDetails;
  setContact: (c: ContactDetails) => void;
  seats: string[];
  setSeats: (s: string[]) => void;
  bookings: Booking[];
  lastBooking: Booking | null;
  confirmBooking: (total: number) => Booking;
  cancelBooking: (ref: string) => void;
  user: { email: string } | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const defaultQuery: SearchQuery = {
  mode: "flight",
  from: "Delhi",
  to: "Mumbai",
  departDate: "",
  returnDate: "",
  roundTrip: false,
  passengers: 1,
  travelClass: "Economy",
};

const Ctx = createContext<BookingState | null>(null);

function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "WF";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState<SearchQuery>(defaultQuery);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<PassengerDetails[]>([
    { name: "", age: "", gender: "" },
  ]);
  const [contact, setContact] = useState<ContactDetails>({ email: "", phone: "" });
  const [seats, setSeats] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const value = useMemo<BookingState>(
    () => ({
      query,
      setQuery,
      selectedTrip,
      setSelectedTrip,
      passengers,
      setPassengers,
      contact,
      setContact,
      seats,
      setSeats,
      bookings,
      lastBooking,
      confirmBooking: (total: number) => {
        const booking: Booking = {
          ref: makeRef(),
          trip: selectedTrip!,
          date: query.departDate || new Date().toISOString().slice(0, 10),
          passengers,
          seats,
          total,
          status: "Confirmed" as BookingStatus,
        };
        setBookings((prev) => [booking, ...prev]);
        setLastBooking(booking);
        return booking;
      },
      cancelBooking: (ref: string) =>
        setBookings((prev) =>
          prev.map((b) => (b.ref === ref ? { ...b, status: "Cancelled" as BookingStatus } : b)),
        ),
      user,
      signIn: (email: string) => setUser({ email }),
      signOut: () => setUser(null),
    }),
    [query, selectedTrip, passengers, contact, seats, bookings, lastBooking, user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
