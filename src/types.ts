export interface Talent {
  id: string;
  username?: string;
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  categories: string[];
  location: string;
  profileImage: string;
  galleryImages: string[];
  bio: string;
  isPremium: boolean;
  stats: {
    height: number; // in cm
    chestOrBust?: number; // in cm
    waist?: number; // in cm
    hips?: number; // in cm
    shoeSize?: number; // EU
    eyeColor: string;
    hairColor: string;
    hairLength?: string;
  };
  experience: string[];
}

export interface CastingCall {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  requirements: {
    gender: 'Male' | 'Female' | 'All' | 'Non-binary';
    ageRange: string;
    languages?: string[];
    details: string;
  };
  location: string;
  paymentType: 'Paid' | 'Unpaid' | 'Collaborative';
  rate: string; // e.g. "AED 1,500 / Day" or "AED 5,000 standard flat fee"
  expiryDate: string; // e.g. "2026-07-15"
  shootDate: string; // e.g. "2026-07-22"
  imageUrl: string;
  status: 'Open' | 'Expired' | 'Filled';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  quote: string;
  verified: boolean;
  project: string;
}

export interface BlogItem {
  id: string;
  title: string;
  category: string;
  categoryId?: number;
  readTime: string;
  date: string;
  summary: string;
  imageUrl: string;
  content: string;
}
