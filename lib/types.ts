export type Review = {
  id: number;
  rating: number;
  text: string | null;
  createdAt: string;
  dealAt: string | null;
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
    domclickRating: number | null;
    domclickReviewVotes: number;
    cianYears: string;
    worksSince: number;
    address: string;
    phone: string;
    workHours: string;
  };
  reviews: Review[];
};

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
