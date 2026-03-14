export type BusinessType =
  | "barbershop"
  | "hair_salon"
  | "nail_salon"
  | "beauty_salon"
  | "day_spa"
  | "massage_studio"
  | "wellness_centre"
  | "cosmetic_studio"
  | "other";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  barbershop:       "Barbershop",
  hair_salon:       "Hair Salon",
  nail_salon:       "Nail Salon",
  beauty_salon:     "Beauty Salon",
  day_spa:          "Day Spa",
  massage_studio:   "Massage Studio",
  wellness_centre:  "Wellness Centre",
  cosmetic_studio:  "Cosmetic Studio",
  other:            "Other",
};

export const AUSTRALIAN_STATES = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT",  label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA",  label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA",  label: "Western Australia" },
] as const;

export interface StoreAddress {
  line1:    string;
  line2?:   string;
  suburb:   string;
  state:    string;
  postcode: string;
  country:  string;
}

export interface StoreProfile {
  id:           string;
  shopName:     string;
  businessType: BusinessType;
  description?: string;
  logo?:        string;

  phone:    string;
  email:    string;
  website?: string;

  address: StoreAddress;

  instagram?: string;
  facebook?:  string;
  tiktok?:    string;

  updatedAt: string;
}

export type StoreProfileFormValues = Omit<StoreProfile, "id" | "updatedAt">;
