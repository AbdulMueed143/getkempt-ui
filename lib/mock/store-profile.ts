import type { StoreProfile } from "@/types/store-profile";

export const MOCK_STORE_PROFILE: StoreProfile = {
  id:           "store-001",
  shopName:     "The Kempt Studio",
  businessType: "barbershop",
  description:
    "Melbourne's favourite neighbourhood barbershop. Fresh cuts, cold brews, and good vibes — since 2018.",
  logo: undefined,

  phone:   "+61 3 9012 3456",
  email:   "hello@thekemptstudio.com.au",
  website: "https://thekemptstudio.com.au",

  address: {
    line1:    "142 Smith Street",
    line2:    "Shop 3",
    suburb:   "Collingwood",
    state:    "VIC",
    postcode: "3066",
    country:  "Australia",
  },

  instagram: "thekemptstudio",
  facebook:  "thekemptstudio",
  tiktok:    "",

  updatedAt: "2026-02-15T03:00:00Z",
};
