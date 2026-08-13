import listingsJson from "@/data/listings.json";
import agencyJson from "@/data/agency.json";
import externalReviewsJson from "@/data/reviews-external.json";

export type Listing = {
  id: string;
  source: "cian" | "domclick";
  url: string;
  dealType: "sale" | "rent";
  category: "flat" | "room" | "house" | "land";
  title: string;
  badge: string | null;
  price: number;
  priceNote: string | null;
  area: number | null;
  floor: string | null;
  rooms: number | null;
  address: string;
  metro: string | null;
  highlight: string;
  photos: string[];
};

export type Agent = {
  name: string;
  casId: number;
  verified: boolean;
  avatar: string | null;
  registeredAt: string;
  deals12m: number;
  ratingAvg: number | null;
  ratingVotes: number;
};

export type Review = {
  id: number;
  rating: number;
  text: string | null;
  createdAt: string;
  dealAt: string | null;
  agent: string;
  author: string;
};

export type AgencyData = {
  updatedAt: string;
  agency: {
    name: string;
    nameLegal: string;
    inn: string;
    ogrn: string;
    dealsCount12m: number;
    domclickRating: number;
    domclickReviewVotes: number;
    cianYears: string;
    worksSince: number;
    address: string;
    phone: string;
    workHours: string;
  };
  agents: Agent[];
  reviews: Review[];
};

export function getListings(): { updatedAt: string; listings: Listing[] } {
  const { updatedAt, listings } = listingsJson as {
    updatedAt: string;
    listings: Listing[];
  };
  return { updatedAt, listings };
}

export function getAgency(): AgencyData {
  return agencyJson as unknown as AgencyData;
}

export type ExternalReview = {
  source: string;
  sourceLabel: string;
  url: string;
  author: string;
  date: string;
  rating: number;
  agent: string | null;
  text: string;
};

export function getExternalReviews(): ExternalReview[] {
  return (externalReviewsJson as { reviews: ExternalReview[] }).reviews;
}

/** Единый формат цитаты для карусели отзывов. */
export type QuoteReview = {
  id: string;
  text: string;
  author: string;
  date: string;
  rating: number;
  sourceLabel: string;
  url: string;
  agentNote: string | null;
};

export function formatPrice(price: number, note?: string | null): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(price);
  return note ? `${formatted} ₽ ${note}` : `${formatted} ₽`;
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(d);
}
